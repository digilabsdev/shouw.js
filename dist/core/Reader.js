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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reader = void 0;
const fs = __importStar(require("node:fs"));
const chalk_1 = __importDefault(require("chalk"));
class Reader {
    filePath;
    fileContent = '';
    constructor(filePath) {
        this.filePath = filePath;
    }
    static run(filePath) {
        return new Reader(filePath).execute();
    }
    readFile() {
        try {
            this.fileContent = fs.readFileSync(this.filePath, 'utf8');
        }
        catch (err) {
            throw new SyntaxError(generateError(err.message));
        }
    }
    removeComments(code = '') {
        const start = code.indexOf('/*');
        const end = code.indexOf('*/');
        if (start !== -1 && (end === -1 || end < start)) {
            throw new SyntaxError(generateError(`Unclosed block comment (/* ... ${chalk_1.default.red('> */ <')})`, this.filePath, code.trim().slice(start, start + 50)));
        }
        let result = '';
        let i = 0;
        while (i < code.length) {
            const blockStart = code.indexOf('/*', i);
            const lineStart = code.indexOf('//', i);
            if (blockStart === -1 && lineStart === -1) {
                result += code.slice(i);
                break;
            }
            if (blockStart !== -1 && (lineStart === -1 || blockStart < lineStart)) {
                result += code.slice(i, blockStart);
                const blockEnd = code.indexOf('*/', blockStart + 2);
                i = blockEnd !== -1 ? blockEnd + 2 : code.length;
            }
            else {
                result += code.slice(i, lineStart);
                const lineEnd = code.indexOf('\n', lineStart);
                i = lineEnd !== -1 ? lineEnd : code.length;
            }
        }
        return result.trim();
    }
    parse() {
        const commandRegex = /@Command\(\s*(\{[\s\S]*?\})?\s*\)(;)?/gi;
        const objectRegex = /@Command\(\s*(\{[\s\S]*?\})\s*\)(;)?/i;
        const cleanedContent = this.removeComments(this.fileContent);
        const matches = [...cleanedContent.matchAll(commandRegex)];
        if (!matches.length)
            throw new SyntaxError(generateError('Missing @Command({ ... }) declaration', this.filePath));
        const commands = [];
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const commandStart = match.index;
            const commandEnd = commandStart + match[0].length;
            const extractedCode = match[0].match(objectRegex);
            const nextCommandStart = i + 1 < matches.length ? matches[i + 1].index : cleanedContent.length;
            const codeBlock = cleanedContent.slice(commandEnd, nextCommandStart).trim();
            if (!codeBlock) {
                throw new SyntaxError(generateError('Missing code after @Command({ ... }) declaration', this.filePath, match[0]));
            }
            try {
                const obj = new Function(`return ${extractedCode ? extractedCode[1] : '{}'}`)();
                obj.type = obj.type ?? 'messageCreate';
                commands.push({ ...obj, code: codeBlock });
            }
            catch (err) {
                throw new SyntaxError(generateError(err.message, this.filePath, match[0]));
            }
        }
        return Array.isArray(commands) ? commands : [commands];
    }
    execute() {
        this.readFile();
        return this.parse();
    }
}
exports.Reader = Reader;
function generateError(message, file, code) {
    return `${message}${file ? ` in ${chalk_1.default.yellow(file)}\n\n` : ''}${code ? `${highlightError(code)}\n` : ''}`;
}
function highlightError(code) {
    const lines = code ? code.trim().split('\n') : [];
    return chalk_1.default.red(lines.map((line) => `> | ${line}`).join('\n'));
}
