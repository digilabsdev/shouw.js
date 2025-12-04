"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Message extends index_js_1.Functions {
    constructor() {
        super({
            name: '$message',
            description: 'This function will return the message content of the message that triggered the command',
            brackets: false,
            example,
            params: [
                {
                    name: 'index',
                    description: 'The index of the message content arguments',
                    required: false,
                    type: index_js_1.ParamType.Number,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [index = Number.NaN]) {
        return this.success(Number.isNaN(index) ? ctx.args?.join(' ') : ctx.args?.[index - 1]);
    }
}
exports.default = Message;
const example = `
$message // returns the full message content
$message[1] // returns the first argument
$message[2] // returns the second argument
`;
