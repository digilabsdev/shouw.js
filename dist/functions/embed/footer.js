"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Footer extends index_js_1.Functions {
    constructor() {
        super({
            name: '$footer',
            description: 'This function will set the footer of the embed',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'text',
                    description: 'The footer text for the embed',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'iconURL',
                    description: 'The footer icon URL for the embed',
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
    code(ctx, [text, iconURL, index]) {
        index = !index ? 0 : index - 1;
        if (!ctx.getEmbeds())
            ctx.setEmbeds([]);
        if (!ctx.getEmbed(index))
            ctx.pushEmbed(new ctx.discord.EmbedBuilder(), index);
        if (!iconURL || iconURL === '') {
            ctx.getEmbed(index).setFooter({ text });
        }
        else {
            ctx.getEmbed(index).setFooter({ text, iconURL });
        }
        return this.success();
    }
}
exports.default = Footer;
const example = `
$footer[Footer Text] // sets the footer without an icon

$footer[Footer Text;https://example.com/icon.png]
$footer[Footer Text;https://example.com/icon.png;2] // sets the footer of the second embed
`;
