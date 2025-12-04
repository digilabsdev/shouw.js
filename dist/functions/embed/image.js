"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Image extends index_js_1.Functions {
    constructor() {
        super({
            name: '$image',
            description: 'This function will set the image of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'imageURL',
                    description: 'The image URL for the embed',
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
        ctx.getEmbed(index).setImage(text);
        return this.success();
    }
}
exports.default = Image;
const example = `
$image[https://example.com/image.png]
$image[https://example.com/image.png;2] // sets the image of the second embed
`;
