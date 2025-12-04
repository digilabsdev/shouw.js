"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ChannelID extends index_js_1.Functions {
    constructor() {
        super({
            name: '$channelId',
            description: 'This function will return the ID of the channel.',
            brackets: false,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the channel',
                    required: false,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name]) {
        return this.success((await ctx.util.getChannel(ctx, name))?.id ?? ctx.channel?.id);
    }
}
exports.default = ChannelID;
const example = `
$channelId // Returns the ID of the current channel
$channelId[channel-name] // Returns the ID of the channel with the name 'channel-name'
`;
