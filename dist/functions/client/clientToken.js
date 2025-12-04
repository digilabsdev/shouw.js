"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ClientToken extends index_js_1.Functions {
    constructor() {
        super({
            name: '$clientToken',
            description: 'This function will return the bot token.',
            brackets: false,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'spoiler',
                    description: 'Whether to spoiler the token or not.',
                    type: index_js_1.ParamType.Boolean,
                    required: false,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [spoiler = false]) {
        return this.success(spoiler === true ? `||${ctx.client.token}||` : ctx.client.token);
    }
}
exports.default = ClientToken;
const example = `
$clientToken // returns the bot token
$clientToken[true] // returns the bot token with spoiler
`;
