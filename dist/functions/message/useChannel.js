"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class UseChannel extends index_js_1.Functions {
    constructor() {
        super({
            name: '$useChannel',
            description: 'This function will set the channel to send messages to',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'channelId',
                    description: 'The channel id to send the message to',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [channelId]) {
        const channel = (await ctx.util.getChannel(ctx, channelId));
        if (!channel)
            return await ctx.error(ctx.constants.Errors.channelNotFound(channelId), this.name);
        ctx.setUseChannel(channel);
        return this.success();
    }
}
exports.default = UseChannel;
const example = `
$useChannel[123456789012345678]
$sendMessage[Hello World!] // will send the message to the channel with the id 123456789012345678
`;
