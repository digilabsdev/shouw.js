"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SuppressErrors extends index_js_1.Functions {
    constructor() {
        super({
            name: '$suppressErrors',
            description: 'This function will suppress errors and not send them to the channel the command was sent in.',
            brackets: false,
            example,
            params: [
                {
                    name: 'message',
                    description: 'The message to send when the error is suppressed.',
                    required: false,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [message]) {
        if (!message) {
            ctx.setSuppress(true);
        }
        else {
            const parser = await ctx.parser(ctx, message);
            ctx.setSuppress(true, parser);
        }
        return this.success();
    }
}
exports.default = SuppressErrors;
const example = `
$suppressErrors // suppresses errors
$suppressErrors[This is an error message] // suppresses errors and sends "This is an error message" when an error occurs
`;
