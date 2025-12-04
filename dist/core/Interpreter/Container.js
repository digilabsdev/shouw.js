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
exports.Container = void 0;
const index_js_1 = require("../../index.js");
const Discord = __importStar(require("discord.js"));
class Container {
    client;
    functions;
    debug;
    start = performance.now();
    interpreter = index_js_1.Interpreter;
    code;
    command;
    channel;
    useChannel;
    guild;
    member;
    user;
    context;
    args;
    embeds = [];
    attachments = [];
    stickers = [];
    flags = [];
    message = void 0;
    interaction = void 0;
    noop = () => { };
    helpers;
    Temporarily;
    discord = Discord;
    util = index_js_1.Util;
    extras;
    isError = false;
    components = [];
    suppressErrors;
    currentFunction = null;
    constructor(cmd, options, extras) {
        this.client = options.client;
        this.functions = this.client.functions;
        this.debug = options.debug;
        this.code = cmd.code;
        this.command = cmd;
        this.channel = options.channel;
        this.message = options.message;
        this.interaction = options.interaction;
        this.guild = options.guild;
        this.member = options.member;
        this.user = options.user;
        this.context = options.context;
        this.args = options.args;
        this.suppressErrors = {
            suppress: options.suppressErrors?.suppress ?? false,
            message: options.suppressErrors?.message ?? void 0
        };
        this.helpers = {
            parser: index_js_1.Parser,
            sleep: index_js_1.sleep,
            time: index_js_1.Time,
            condition: index_js_1.CheckCondition,
            interpreter: index_js_1.Interpreter,
            unescape: (str) => str.unescape(),
            escape: (str) => str.escape(),
            mustEscape: (str) => str.mustEscape()
        };
        this.Temporarily = {
            ...options.Temporarily,
            arrays: {},
            objects: {},
            variables: {},
            constants: {},
            splits: [],
            randoms: {},
            timezone: void 0
        };
        this.extras = {
            sendMessage: extras?.sendMessage ?? true,
            returnId: extras?.returnId ?? false,
            returnResult: extras?.returnResult ?? true,
            returnError: extras?.returnError ?? false,
            returnData: extras?.returnData ?? false
        };
        if (!this.context || !(this.context instanceof index_js_1.Context)) {
            this.context = new index_js_1.Context(this.message ??
                this.interaction ??
                {
                    client: this.client,
                    channel: this.channel,
                    guild: this.guild,
                    member: this.member,
                    user: this.user
                }, this.args ?? []);
        }
    }
    setObject(name, value) {
        this.Temporarily.objects[name] = value;
        return this;
    }
    getObject(name) {
        return this.Temporarily.objects[name];
    }
    getObjectProperty(name, property) {
        const obj = this.Temporarily.objects[name];
        if (!obj || this.isArray(name))
            return void 0;
        return new Function('obj', `return obj.${property}`)(obj);
    }
    getObjectArrayIndex(name, index) {
        const obj = this.Temporarily.objects[name];
        if (!obj || !this.isArray(name))
            return void 0;
        return obj[index];
    }
    setObjectProperty(name, property, value) {
        const obj = this.Temporarily.objects[name];
        if (!obj || this.isArray(name))
            return this;
        this.setObject(name, new Function('obj', 'value', `obj.${property} = value; return obj;`)(obj, value));
        return this;
    }
    isArray(name) {
        const obj = this.Temporarily.objects[name];
        if (!obj || !Array.isArray(obj))
            return false;
        return true;
    }
    hasObject(name) {
        return Object.hasOwn(this.Temporarily.objects, name);
    }
    deleteObject(name) {
        if (this.hasObject(name))
            delete this.Temporarily.objects[name];
    }
    setArray(name, value) {
        this.Temporarily.arrays[name] = value;
        return this;
    }
    getArray(name) {
        return this.Temporarily.arrays[name];
    }
    getArrayIndex(name, index) {
        const arr = this.Temporarily.arrays[name];
        if (!arr || !Array.isArray(arr) || !arr.length)
            return void 0;
        return arr[index];
    }
    hasArray(name) {
        return Object.hasOwn(this.Temporarily.arrays, name);
    }
    deleteArray(name) {
        if (this.hasArray(name))
            delete this.Temporarily.arrays[name];
        return this;
    }
    setStickers(stickers) {
        this.stickers = stickers;
        return this;
    }
    pushSticker(sticker) {
        this.stickers.push(sticker);
        return this;
    }
    getStickers() {
        return this.stickers;
    }
    setError(error) {
        this.isError = error;
        return this;
    }
    getError() {
        return this.isError;
    }
    setComponents(components) {
        this.components = components;
        return this;
    }
    pushComponent(component, index) {
        if (index !== null && index !== void 0) {
            this.components[index] = component;
            return this;
        }
        this.components.push(component);
        return this;
    }
    getComponent(index) {
        return index === null || index === void 0 ? this.components[0] : this.components[index];
    }
    getComponents() {
        return this.components;
    }
    setFlags(flags) {
        this.flags = flags;
        return this;
    }
    pushFlag(flag) {
        this.flags.push(flag);
        return this;
    }
    getFlags() {
        return this.flags;
    }
    setAttachments(attachments) {
        this.attachments = attachments;
        return this;
    }
    pushAttachment(attachment, index) {
        if (index !== null && index !== void 0) {
            this.attachments[index] = attachment;
            return this;
        }
        this.attachments.push(attachment);
        return this;
    }
    getAttachment(index) {
        return index === null || index === void 0 ? this.attachments[0] : this.attachments[index];
    }
    getAttachments() {
        return this.attachments;
    }
    setEmbeds(embeds) {
        this.embeds = embeds;
        return this;
    }
    pushEmbed(embed, index) {
        if (index !== null && index !== void 0) {
            this.embeds[index] = embed;
            return this;
        }
        this.embeds.push(embed);
        return this;
    }
    getEmbed(index) {
        return index === null || index === void 0 ? this.embeds[0] : this.embeds[index];
    }
    getEmbeds() {
        return this.embeds;
    }
    setSuppress(suppress, message) {
        this.setSuppressSuppress(suppress);
        if (message)
            this.setSuppressMessage(message);
        return this;
    }
    setSuppressMessage(message) {
        this.suppressErrors.message = message;
        return this;
    }
    setSuppressSuppress(suppress) {
        this.suppressErrors.suppress = suppress;
        return this;
    }
    getSuppress() {
        return this.suppressErrors;
    }
    setUseChannel(channel) {
        this.useChannel = channel;
        return this;
    }
    getUseChannel() {
        return this.useChannel ?? this.channel;
    }
    getSendableChannel() {
        return this.useChannel ?? this.context;
    }
    setVariable(name, value) {
        this.Temporarily.variables[name] = value;
        return this;
    }
    getVariable(name) {
        return this.Temporarily.variables[name];
    }
    hasVariable(name) {
        return Object.hasOwn(this.Temporarily.variables, name);
    }
    deleteVariable(name) {
        if (this.hasVariable(name))
            delete this.Temporarily.variables[name];
        if (this.hasConstantVariable(name))
            delete this.Temporarily.constants[name];
        return this;
    }
    setConstantVariable(name, value) {
        this.Temporarily.constants[name] = value;
        return this;
    }
    getConstantVariable(name) {
        return this.Temporarily.constants[name];
    }
    hasConstantVariable(name) {
        return Object.hasOwn(this.Temporarily.constants, name);
    }
    setSplits(split) {
        this.Temporarily.splits = split;
        return this;
    }
    getSplit(index) {
        return !index || Number.isNaN(index) ? this.Temporarily.splits[0] : this.Temporarily.splits[index];
    }
    getSplits() {
        return this.Temporarily.splits;
    }
    setRandom(name, value) {
        this.Temporarily.randoms[name] = value;
        return this;
    }
    getRandom(name) {
        return this.Temporarily.randoms[name];
    }
    setTimezone(timezone) {
        this.Temporarily.timezone = timezone;
        return this;
    }
    getTimezone() {
        return this.Temporarily.timezone;
    }
    createCache(name) {
        return this.client.cacheManager.createCache(name);
    }
    getCache(name) {
        return this.client.cacheManager.getCache(name);
    }
    hasCache(name) {
        return this.client.cacheManager.hasCache(name);
    }
    deleteCache(name) {
        return this.client.cacheManager.deleteCache(name);
    }
    getCacheData(name, key) {
        return this.client.cacheManager.get(name, key);
    }
    setCacheData(name, key, value) {
        return this.client.cacheManager.set(name, key, value);
    }
    deleteCacheData(name, key) {
        return this.client.cacheManager.delete(name, key);
    }
    clearCache(name) {
        return this.client.cacheManager.clear(name);
    }
    hasCacheData(name, key) {
        return this.client.cacheManager.has(name, key);
    }
    getCacheSize(name) {
        return this.client.cacheManager.size(name);
    }
    async parser(ctx, input) {
        return await (0, index_js_1.Parser)(ctx, input);
    }
    async sleep(ms) {
        await (0, index_js_1.sleep)(ms);
    }
    get time() {
        return index_js_1.Time;
    }
    condition(input) {
        return (0, index_js_1.CheckCondition)(input);
    }
    unescape(str) {
        return str.unescape();
    }
    escape(str) {
        return str.escape();
    }
    mustEscape(str) {
        return str.mustEscape();
    }
    get constants() {
        return index_js_1.Constants;
    }
}
exports.Container = Container;
