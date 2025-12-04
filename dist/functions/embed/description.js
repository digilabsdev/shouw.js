"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Description extends index_js_1.Functions {
    constructor() {
        super({
            name: '$description',
            description: 'This function will set the description of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'content',
                    description: 'The description for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
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
        ctx.getEmbed(index).setDescription(text);
        return this.success();
    }
}
exports.default = Description;
const example = `
$description[This is a description]
$description[This is a description;2] // sets the description of the second embed
`;
