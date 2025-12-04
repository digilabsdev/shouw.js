"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IF = void 0;
const index_js_1 = require("../../index.js");
class IF {
    code;
    ctx;
    index;
    constructor(code, ctx, index) {
        this.code = code;
        this.ctx = ctx;
        this.index = index;
    }
    static async run(code, ctx, index) {
        return await new IF(code, ctx, index).initialize();
    }
    async initialize() {
        const lower = this.code.toLowerCase();
        if (!lower.includes('$if['))
            return { code: this.code, error: false, index: 0, length: 0 };
        if (!lower.includes('$endif')) {
            await this.ctx.error(index_js_1.Constants.Errors.missingEndif);
            return { code: this.code, error: true, index: 0, length: 0 };
        }
        const startIndex = lower.indexOf('$if[', this.index);
        const block = this.extractTopLevelBlock(this.code.slice(startIndex), '$if[', '$endif');
        if (!block) {
            await this.ctx.error(index_js_1.Constants.Errors.missingEndif);
            return { code: this.code, error: true, index: 0, length: 0 };
        }
        const { full } = block;
        const branches = this.parseBranches(full);
        let output = '';
        let matched = false;
        for (const branch of branches) {
            const isConditionBranch = branch.type === 'if' || branch.type === 'elseif';
            if (isConditionBranch && !matched) {
                const result = branch.condition
                    ?
                        await this.ctx.processFunction(`$checkCondition[${branch.condition}]`)
                    : 'false';
                if (result === 'true') {
                    output = branch.code;
                    matched = true;
                }
            }
            else if (branch.type === 'else' && !matched) {
                output = branch.code;
                break;
            }
        }
        const result = this.code.slice(0, startIndex) + output + this.code.slice(startIndex + full.length);
        return {
            code: result,
            error: false,
            index: startIndex,
            length: output.length
        };
    }
    parseBranches(full) {
        const branches = [];
        const result = [];
        let i = 0;
        let depth = -1;
        while (i < full.length) {
            const lower = full.slice(i).toLowerCase();
            if (lower.startsWith('$if[')) {
                depth++;
                if (depth === 0) {
                    const condition = this.extractCondition(full.slice(i));
                    branches.push({ type: 'if', condition, index: i });
                    i += 4 + condition.length + 1;
                    continue;
                }
            }
            else if (lower.startsWith('$endif')) {
                depth--;
                if (depth === -1) {
                    branches.push({ type: 'endif', condition: '', index: i });
                    i += 6;
                    break;
                }
            }
            if (depth !== 0) {
                i++;
                continue;
            }
            if (lower.startsWith('$elseif[')) {
                const condition = this.extractCondition(full.slice(i));
                branches.push({ type: 'elseif', condition, index: i });
                i += 8 + condition.length + 1;
            }
            else if (lower.startsWith('$else')) {
                branches.push({ type: 'else', condition: '', index: i });
                i += 5;
            }
            else {
                i++;
            }
        }
        for (let j = 0; j < branches.length; j++) {
            const { type, condition, index } = branches[j];
            const nextIndex = branches[j + 1]?.index ?? full.length;
            let contentStart = index;
            if (type === 'if')
                contentStart += 4 + condition.length + 1;
            else if (type === 'elseif')
                contentStart += 8 + condition.length + 1;
            else if (type === 'else')
                contentStart += 5;
            else if (type === 'endif')
                contentStart += 6;
            const code = full.slice(contentStart, nextIndex).trim();
            result.push({ type, condition, code });
        }
        return result;
    }
    extractTopLevelBlock(str, open, close) {
        let depth = 0;
        let start = -1;
        let i = 0;
        while (i < str.length) {
            if (str.toLowerCase().startsWith(open, i)) {
                if (depth === 0)
                    start = i;
                depth++;
                i += open.length;
            }
            else if (str.toLowerCase().startsWith(close, i)) {
                depth--;
                i += close.length;
                if (depth === 0 && start !== -1) {
                    return {
                        full: str.slice(0, i),
                        body: str.slice(open.length, i - close.length)
                    };
                }
            }
            else {
                i++;
            }
        }
        return null;
    }
    extractCondition(str) {
        let depth = 0;
        let start = -1;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '[') {
                if (depth === 0)
                    start = i;
                depth++;
            }
            else if (str[i] === ']') {
                depth--;
                if (depth === 0)
                    return str.slice(start + 1, i);
            }
        }
        return '';
    }
}
exports.IF = IF;
