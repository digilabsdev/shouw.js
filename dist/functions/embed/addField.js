"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class AddField extends index_js_1.Functions {
    constructor() {
        super({
            name: '$addField',
            description: 'This function will add a field to the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'title',
                    description: 'The field title for the embed',
                    required: false,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'content',
                    description: 'The field content for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'inline',
                    description: 'Whether the field should be inline',
                    required: false,
                    type: index_js_1.ParamType.Boolean
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
    code(ctx, [title, content, inline, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        ctx.getEmbed(index).addFields({
            name: title ?? '\u200B',
            value: content,
            inline: inline ?? false
        });
        return this.success();
    }
}
exports.default = AddField;
const example = `
$addField[Title;Content;true]
$addField[Title;Content;true;2] // adds the field to the second embed

$addField[;Content;true] // adds the field with a blank title
`;
