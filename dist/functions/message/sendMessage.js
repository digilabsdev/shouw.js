"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SendMessage extends index_js_1.Functions {
    constructor() {
        super({
            name: '$sendMessage',
            description: 'This function will send a message to the current channel',
            brackets: true,
            example,
            params: [
                {
                    name: 'content',
                    description: 'The content of the message',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'returnId',
                    description: 'Return the message id',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                }
            ]
        });
    }
    async code(ctx, [content, returnId]) {
        const parser = await ctx.helpers.parser(ctx, content);
        const msg = await ctx.context?.send(parser);
        return this.success(returnId ? msg?.id : '');
    }
}
exports.default = SendMessage;
const example = `
$sendMessage[Hello World!]
$sendMessage[Hello World!;true] // returns the message id
`;
