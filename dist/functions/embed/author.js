"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Author extends index_js_1.Functions {
    constructor() {
        super({
            name: '$author',
            description: 'This function will set the author of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The author name for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'iconURL',
                    description: 'The author icon URL for the embed',
                    required: false,
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
    code(ctx, [name, iconURL, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        if (!iconURL || iconURL === '') {
            ctx.getEmbed(index).setAuthor({ name });
        }
        else {
            ctx.getEmbed(index).setAuthor({ name, iconURL });
        }
        return this.success();
    }
}
exports.default = Author;
const example = `
$author[Author Name] // sets the author without an icon

$author[Author Name;https://example.com/icon.png]
$author[Author Name;https://example.com/icon.png;2] // sets the author of the second embed
`;
