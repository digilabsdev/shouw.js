"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Thumbnail extends index_js_1.Functions {
    constructor() {
        super({
            name: '$thumbnail',
            description: 'This function will set the thumbnail of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'thumbnailURL',
                    description: 'The thumbnail URL for the embed',
                    required: true,
                    type: index_js_1.ParamType.URL
                },
                {
                    name: 'index',
                    description: 'The index to add this data to',
                    required: false,
                    type: index_js_1.ParamType.Number
                }
            ]
        });
    }
    code(ctx, [text, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        ctx.getEmbed(index).setThumbnail(text);
        return this.success();
    }
}
exports.default = Thumbnail;
const example = `
$thumbnail[https://example.com/thumbnail.png]
$thumbnail[https://example.com/thumbnail.png;2] // sets the thumbnail of the second embed
`;
