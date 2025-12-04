"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
const discord_js_1 = require("discord.js");
class AddButton extends index_js_1.Functions {
    constructor() {
        super({
            name: '$addButton',
            description: 'This function will add a button to the message',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'row',
                    description: 'The row to add the button to',
                    required: true,
                    type: index_js_1.ParamType.Number
                },
                {
                    name: 'label',
                    description: 'The label of the button',
                    required: false,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'style',
                    description: 'The style of the button',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'customId',
                    description: 'The custom id of the button',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'disabled',
                    description: 'Whether the button is disabled',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                },
                {
                    name: 'emoji',
                    description: 'The emoji of the button',
                    required: false,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [row, label, styleStr, customId, disabled = false, emoji = '']) {
        row = (Number.isNaN(row) ? 1 : row) - 1;
        if (!ctx.getComponents())
            ctx.setComponents([]);
        if (!ctx.getComponent(row))
            ctx.pushComponent({
                type: discord_js_1.ComponentType.ActionRow,
                components: []
            }, row);
        if (emoji)
            emoji = ((await ctx.util.getEmoji(ctx, emoji)) ?? emoji);
        let style = null;
        switch (styleStr.toLowerCase()) {
            case 'primary':
            case '1':
                style = ctx.discord.ButtonStyle.Primary;
                break;
            case 'secondary':
            case '2':
                style = ctx.discord.ButtonStyle.Secondary;
                break;
            case 'success':
            case '3':
                style = ctx.discord.ButtonStyle.Success;
                break;
            case 'danger':
            case '4':
                style = ctx.discord.ButtonStyle.Danger;
                break;
            case 'link':
            case '5':
                style = ctx.discord.ButtonStyle.Link;
                break;
            case 'premium':
            case '6':
                style = ctx.discord.ButtonStyle.Premium;
                break;
            default:
                return await ctx.error(ctx.constants.Errors.invalidButtonStyle(styleStr), this.name);
        }
        let button = null;
        if (style === discord_js_1.ButtonStyle.Link) {
            button = {
                type: discord_js_1.ComponentType.Button,
                label,
                style,
                url: customId,
                disabled,
                emoji: emoji
            };
        }
        else if (style === discord_js_1.ButtonStyle.Premium) {
            button = {
                type: discord_js_1.ComponentType.Button,
                style,
                sku_id: customId,
                disabled
            };
        }
        else {
            button = {
                type: discord_js_1.ComponentType.Button,
                label,
                style,
                custom_id: customId,
                disabled,
                emoji: emoji
            };
        }
        ctx.getComponent(row).components.push(button);
        return this.success();
    }
}
exports.default = AddButton;
const example = `
$addButton[1;Click me!;Primary;customId;false]
$addButton[1;Don't Click Me!;Secondary;customId;true;😊]
`;
