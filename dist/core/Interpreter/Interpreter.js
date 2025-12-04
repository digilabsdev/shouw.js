"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const index_js_1 = require("../../index.js");
const Container_js_1 = require("./Container.js");
const Discord = __importStar(require("discord.js"));
class Interpreter extends Container_js_1.Container {
    static async run(command, options, extras) {
        return await new Interpreter(command, options, extras).initialize();
    }
    async initialize() {
        try {
            if (typeof this.code === 'function') {
                await this.code(this, this.context, this.Temporarily);
                return new Object();
            }
            const result = await this.processFunction(this.code);
            this.code = this.replaceExecutionTime(result);
            if (this.shouldSendMessage()) {
                this.message = (await this.getSendableChannel()?.send({
                    content: this.code !== '' ? this.code : void 0,
                    embeds: this.embeds.filter(Boolean),
                    components: this.components.filter(Boolean),
                    files: this.attachments.filter(Boolean),
                    flags: (Array.isArray(this.flags) ? this.flags.filter(Boolean) : this.flags)
                }));
            }
        }
        catch (err) {
            await this.error(err);
        }
        return this.buildResult();
    }
    async processFunction(input) {
        let currentCode = input.mustEscape().replace(/\$executionTime/gi, () => '#CHAR#executionTime');
        let functions = this.extractFunctions(currentCode);
        if (!functions.length)
            return input;
        let lastIndex = 0;
        for (let i = 0; i < functions.length; i++) {
            const func = functions[i];
            if (!func || this.isError)
                break;
            const functionData = this.functions.get(func);
            if (!functionData?.code)
                continue;
            if (!(functionData instanceof index_js_1.CustomFunction) && typeof functionData.code !== 'function')
                continue;
            const unpacked = this.unpack(func, currentCode, lastIndex);
            if (!unpacked.all)
                continue;
            this.currentFunction = unpacked.all.length > 200 ? 'Hmm... Code is too long to display.' : unpacked.all;
            if (functionData.brackets && !unpacked.brackets)
                await this.error(index_js_1.Constants.Errors.missingBrackets(func, functionData));
            if (this.isError)
                break;
            const processedArgs = await this.processArgs(unpacked.args, functionData);
            if (this.isError)
                break;
            if (functionData instanceof index_js_1.CustomFunction && typeof functionData.codeType === 'string') {
                let code = functionData.stringCode;
                for (const param of functionData.params ?? []) {
                    code = code.replaceAll(`{{${param.name}}}`, () => processedArgs.shift()?.toString() ?? '');
                }
                const result = await this.processFunction(code);
                lastIndex = unpacked.index + (result?.toString().trim() ?? '').length;
                currentCode =
                    currentCode.slice(0, unpacked.index) +
                        (result?.toString().trim() ?? '') +
                        currentCode.slice(unpacked.index + unpacked.all.length);
                i = -1;
                functions = this.extractFunctions(code, false, lastIndex);
                continue;
            }
            if (func.match(/\$if$/i) || func === '$if') {
                const { code, error, index } = await index_js_1.IF.run(currentCode, this, lastIndex);
                this.setError(error);
                if (this.isError)
                    break;
                i = -1;
                functions = this.extractFunctions(code, false, index);
                lastIndex = index;
                currentCode = code;
                continue;
            }
            try {
                if (this.isError || typeof functionData.code !== 'function')
                    break;
                const DATA = ((functionData.isAsync
                    ? await functionData.code(this, processedArgs, this.Temporarily)
                    : functionData.code(this, processedArgs, this.Temporarily)) ?? {});
                currentCode =
                    currentCode.slice(0, unpacked.index) +
                        (DATA.result ?? '') +
                        currentCode.slice(unpacked.index + unpacked.all.length);
                lastIndex = unpacked.index + (typeof DATA.result === 'string' ? DATA.result.length : 0);
                if (this.isError || DATA.error === true)
                    this.setError(true);
                for (const [key, value] of Object.entries(DATA)) {
                    if (!key || !value || !Object.hasOwn(this, key))
                        continue;
                    this[key] = value;
                }
                i = -1;
                functions = this.extractFunctions(currentCode, false, lastIndex);
            }
            catch (err) {
                await this.error(err, func);
            }
        }
        return currentCode.trim();
    }
    async processArgs(args, functionData) {
        const processedArgs = [];
        const totalArgs = Math.max(args.length, functionData.paramsLength);
        for (let i = 0; i < totalArgs; i++) {
            const param = functionData.getParam(i);
            if (!param)
                continue;
            const isVoid = (v) => param.type !== index_js_1.ParamType.Void && (v === undefined || v === null || v === '');
            if (param.rest) {
                const joined = args.slice(i).join(';');
                const result = await this.switchArg(await this.processFunction(joined), param.type ?? index_js_1.ParamType.String, functionData);
                if (this.isError)
                    break;
                if (param.required && isVoid(result))
                    await this.error(index_js_1.Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                if (this.isError)
                    break;
                processedArgs.push(result);
                return functionData.escapeArguments
                    ? processedArgs.map((v) => {
                        if (typeof v === 'string')
                            return v.unescape();
                        return v;
                    })
                    : processedArgs;
            }
            const input = (args[i] ?? '');
            const arg = await this.switchArg(input, param.type ?? index_js_1.ParamType.String, functionData);
            if (this.isError)
                break;
            if (isVoid(arg)) {
                if (param.required)
                    await this.error(index_js_1.Constants.Errors.missingRequiredArgument(functionData.name, param.name));
                if (this.isError)
                    break;
                processedArgs.push(undefined);
                continue;
            }
            const isDirect = (typeof arg === 'string' && !arg.includes('$')) || arg === '$' || typeof arg !== 'string';
            if (isDirect) {
                processedArgs.push(arg);
                continue;
            }
            const processed = await this.switchArg(await this.processFunction(arg), param.type ?? index_js_1.ParamType.String, functionData);
            if (this.isError)
                break;
            if (param.required && isVoid(processed))
                await this.error(index_js_1.Constants.Errors.missingRequiredArgument(functionData.name, param.name));
            if (this.isError)
                break;
            processedArgs.push(processed);
        }
        return functionData.escapeArguments
            ? processedArgs.map((v) => {
                if (typeof v === 'string')
                    return v.unescape();
                return v;
            })
            : processedArgs;
    }
    unpack(func, code, index) {
        const funcStart = code.toLowerCase().indexOf(func.toLowerCase(), index ?? void 0);
        if (funcStart === -1)
            return returnUnpack(func, [], false, null, 0);
        const openBracketIndex = code.indexOf('[', funcStart);
        const onlyFunction = code.slice(funcStart, funcStart + func.length);
        if (openBracketIndex === -1)
            return returnUnpack(func, [], false, onlyFunction, funcStart);
        const textBetween = code.slice(funcStart + func.length, openBracketIndex + 1).trim();
        if (textBetween.match(/\$/) || !textBetween.startsWith('['))
            return returnUnpack(func, [], false, onlyFunction, funcStart);
        let bracketStack = 0;
        let closeBracketIndex = openBracketIndex;
        while (closeBracketIndex < code.length) {
            if (code.charAt(closeBracketIndex) === '[') {
                bracketStack++;
            }
            else if (code.charAt(closeBracketIndex) === ']') {
                bracketStack--;
                if (bracketStack === 0)
                    break;
            }
            closeBracketIndex++;
        }
        if (closeBracketIndex >= code.length || bracketStack > 0)
            return returnUnpack(func, [], false, onlyFunction, funcStart);
        const argsStr = code.slice(openBracketIndex + 1, closeBracketIndex).trim();
        const args = this.extractArguments(argsStr);
        const all = code.slice(funcStart, closeBracketIndex + 1);
        return returnUnpack(func, args, true, all, funcStart);
        function returnUnpack(func, args, brackets, all, i) {
            return { func, args, brackets, all, index: i };
        }
    }
    extractArguments(argsStr) {
        const args = [];
        let depth = 0;
        let currentArg = '';
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr.charAt(i);
            if (char === '[') {
                depth++;
                currentArg += char;
            }
            else if (char === ']') {
                depth--;
                currentArg += char;
            }
            else if (char === ';' && depth === 0) {
                args.push(currentArg.trim());
                currentArg = '';
            }
            else {
                currentArg += char;
            }
        }
        if (currentArg.trim())
            args.push(currentArg.trim());
        return args.map((arg) => {
            if (arg.trim() !== '')
                return arg.trim();
            return void 0;
        });
    }
    extractFunctions(code, custom = false, fromIndex = 0) {
        const functions = [];
        const regex = /\$([^$[\];\s]+)/g;
        let depth = 0;
        let index = fromIndex ?? 0;
        while (index < code.length) {
            const char = code[index];
            if (char === '[') {
                depth++;
                index++;
                continue;
            }
            if (char === ']') {
                depth--;
                index++;
                continue;
            }
            if (depth === 0 && char === '$') {
                regex.lastIndex = index;
                const match = regex.exec(code);
                if (match && match.index === index) {
                    const fullName = `$${match[1]}`;
                    const matched = this.functions.V.filter((f) => fullName.toLowerCase().startsWith(f.name.toLowerCase()) &&
                        (custom ? f instanceof index_js_1.CustomFunction : true)).sort((a, b) => b.name.length - a.name.length)[0];
                    if (matched)
                        functions.push(matched.name);
                    index = regex.lastIndex;
                    continue;
                }
            }
            index++;
        }
        return (0, index_js_1.filterArray)(functions) ?? [];
    }
    success(result = void 0, error, ...data) {
        return { ...data, result, error };
    }
    async error(options, functionName = 'InterpreterError') {
        this.setError(true);
        this.client.emit('functionError', typeof options === 'string' ? options : options.message, functionName, this.currentFunction, this);
        if (this.client.shouwOptions.suppressAllErrors === true)
            return this.success(void 0, true);
        try {
            if (!this.getSendableChannel() || !this.context?.channel)
                throw new Error('No channel to send error message');
            if (this.suppressErrors.suppress === true) {
                if (!this.suppressErrors.message)
                    return { result: void 0, error: true };
                await this.getSendableChannel()?.send(this.suppressErrors.message);
                return this.success(void 0, true);
            }
            this.message = await this.context?.send(index_js_1.Constants.Errors.build(options, functionName, this.currentFunction));
        }
        catch {
            this.client.debug(index_js_1.Constants.Errors.buildLog(options, this.currentFunction), 'ERROR', true);
        }
        this.currentFunction = null;
        return this.success(void 0, true);
    }
    async switchArg(arg, type, functionData) {
        if (!arg || arg === '')
            return void 0;
        let parsed;
        switch (type) {
            case index_js_1.ParamType.String:
                parsed = arg.trim() === '' ? void 0 : arg.trim();
                if (!parsed || typeof parsed !== 'string')
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.BigInt:
                parsed = BigInt(arg);
                if (Number.isNaN(Number(parsed)))
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Number:
                parsed = Number(arg);
                if (Number.isNaN(parsed))
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Boolean:
                parsed = arg.toBoolean();
                if (typeof parsed !== 'boolean')
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Object:
                parsed = arg.toObject();
                if (!parsed)
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Array:
                parsed = arg.toArray();
                if (!parsed)
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Color:
                return Discord.resolveColor(arg);
            case index_js_1.ParamType.URL:
                parsed = arg.toURL();
                if (!parsed)
                    return returnError(this);
                return parsed;
            case index_js_1.ParamType.Any:
                return arg;
            default:
                return void 0;
        }
        async function returnError(ctx) {
            await ctx.error(index_js_1.Constants.Errors.invalidArgumentType(functionData.name, type, parsed));
            return void 0;
        }
    }
    buildResult() {
        return {
            ...(this.extras.returnResult ? { result: this.isError ? '' : this.code } : {}),
            ...(this.extras.returnId ? { id: this.message?.id } : {}),
            ...(this.extras.returnError ? { error: this.isError } : {}),
            ...(this.extras.returnData
                ? {
                    data: {
                        ...this.Temporarily,
                        embeds: this.embeds.filter(Boolean),
                        components: this.components.filter(Boolean),
                        attachments: this.attachments.filter(Boolean),
                        flags: this.flags.filter(Boolean)
                    }
                }
                : {})
        };
    }
    shouldSendMessage() {
        return (this.extras.sendMessage === true &&
            this.isError === false &&
            ((this.code && this.code !== '') ||
                this.components.length > 0 ||
                this.embeds.length > 0 ||
                this.attachments.length > 0 ||
                this.stickers.length > 0));
    }
    replaceExecutionTime(input) {
        const result = input.unescape();
        const end = (performance.now() - this.start).toFixed(2).toString();
        this.embeds = JSON.parse(JSON.stringify(this.embeds).replace(/\$executionTime/gi, () => end));
        this.currentFunction = null;
        this.components = JSON.parse(JSON.stringify(this.components).replace(/\$executionTime/gi, () => end));
        return result.replace(/\$executionTime/gi, () => end);
    }
}
exports.Interpreter = Interpreter;
