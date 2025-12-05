import * as Discord from 'discord.js';
import type { Interpreter, SendData } from '../../index.js';

export type Flags =
    | Discord.BitFieldResolvable<
          'SuppressEmbeds' | 'SuppressNotifications' | 'IsComponentsV2',
          | Discord.MessageFlags.SuppressEmbeds
          | Discord.MessageFlags.SuppressNotifications
          | Discord.MessageFlags.IsComponentsV2
      >
    | undefined;

export type SelectMenuTypes =
    | Discord.APIStringSelectComponent
    | Discord.APIRoleSelectComponent
    | Discord.APIChannelSelectComponent
    | Discord.APIMentionableSelectComponent
    | Discord.APIUserSelectComponent;

export type ComponentTypes =
    | Discord.APIActionRowComponent<Discord.APIComponentInActionRow>
    | Discord.APIContainerComponent
    | Discord.APITextDisplayComponent
    | Discord.APISectionComponent
    | Discord.APIMediaGalleryComponent
    | Discord.APISeparatorComponent
    | undefined;

type CustomParserResult =
    | {
          key: string;
          value: string | Array<undefined | string>;
      }
    | {
          key: string;
          value: string | Array<undefined | string>;
      }[]
    | undefined;

interface ParserData {
    embeds: Array<Discord.APIEmbed>;
    components: Array<ComponentTypes>;
    modal: Discord.APIModalInteractionResponseCallbackData;
    content: string | undefined;
    attachments: Array<unknown | null>;
    flags: Array<Discord.MessageFlags | null>;
    poll: Discord.PollData | null;
    stickers: Array<Discord.StickerResolvable>;
    reply: Discord.ReplyOptions | undefined;
    allowedMentions: Discord.MessageMentionOptions | null;
}

export interface CustomParserData {
    key: string;
    many?: boolean;
    value: string;
}

/**
 * Parser function to parse the input and return the parsed data to send to the channel the command was sent in
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} input - The input to parse
 * @return {Promise<SendData>} - The parsed data
 * @example await Parser(ctx, 'Hello World!'); // { content: 'Hello World!' }
 */
export async function Parser(ctx: Interpreter, input: string): Promise<SendData> {
    const embeds: Array<Discord.APIEmbed> = [];
    const components: Array<any> = [];
    let modal: Discord.APIModalInteractionResponseCallbackData = {} as any;
    const attachments: Array<unknown | null> = [];
    const flags: Array<Discord.MessageFlags | null> = [];
    const stickers: Array<Discord.StickerResolvable> = [];
    let poll: Discord.PollData | null = null;
    let content: string | undefined = input.mustEscape();
    let isParsed = false;
    let reply: Discord.ReplyOptions | undefined = void 0;
    const allowedMentions: Discord.MessageMentionOptions | null = {
        parse: ['users', 'roles', 'everyone'],
        repliedUser: true
    };

    for (const match of matchStructure(content)) {
        const [key, value] = keyValue(match);

        if (key === 'newembed') {
            embeds.push(EmbedParser(ctx, value));
            isParsed = true;
        } else if (key === 'actionrow') {
            components.push(await ActionRowParser(ctx, value));
            isParsed = true;
        } else if (key === 'modal' || key === 'newmodal') {
            modal = await ModalParser(ctx, value);
            isParsed = true;
        } else if (key === 'attachment' || key === 'file') {
            attachments.push(AttachmentParser(ctx, value, key));
            isParsed = true;
        } else if (key === 'flags' || key === 'flag') {
            flags.push(...FlagsParser(ctx, value, key));
            isParsed = true;
        } else if (key === 'poll') {
            poll = await PollParser(ctx, value);
            isParsed = true;
        } else if (key === 'newcontainer' || key === 'container') {
            components.push(await ComponentsV2Parser(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2 as Discord.MessageFlags);
            isParsed = true;
        } else if (key === 'text') {
            components.push({
                type: Discord.ComponentType.TextDisplay,
                content: value.unescape()
            } as Discord.APITextDisplayComponent);
            flags.push(ctx.util.Flags.iscomponentsv2 as Discord.MessageFlags);
            isParsed = true;
        } else if (key === 'section' || key === 'newsection') {
            components.push(await parseSectionV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2 as Discord.MessageFlags);
            isParsed = true;
        } else if (key === 'separator') {
            components.push(parseSeparatorV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2 as Discord.MessageFlags);
            isParsed = true;
        } else if (key === 'gallery') {
            components.push(parseGalleryV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2 as Discord.MessageFlags);
            isParsed = true;
        } else if (key === 'allowedmentions') {
            allowedMentions.parse = splitEscaped(value.toLowerCase()).filter((a) => {
                return ['users', 'roles', 'everyone'].includes(a as string);
            }) as Array<'users' | 'roles' | 'everyone'>;
            isParsed = true;
        } else if (key === 'reply') {
            const splited = splitEscaped(value);
            const messageId = splited[0];
            const mention = splited[1]?.toLowerCase() === 'true';
            const failIfNotExists = splited[2]?.toLowerCase() === 'true';
            if (messageId) {
                allowedMentions.repliedUser = mention;
                reply = {
                    messageReference: messageId,
                    failIfNotExists: failIfNotExists
                };
            }

            isParsed = true;
        }

        if (isParsed) {
            content = content.replace(match[0], '');
            isParsed = false;
        }
    }

    return buildResult(
        {
            embeds,
            components,
            modal,
            content,
            attachments,
            flags,
            poll,
            stickers,
            reply,
            allowedMentions
        },
        ctx
    );
}

/**
 * A function to parse the custom data from the input and return the parsed data
 *
 * @param {string} key - The key to parse
 * @param {string} value - The value to parse
 * @param {'normal' | 'emoji' | 'none'} [split] - The split type
 * @param {boolean} [many] - Whether to parse many values
 * @return { key: string; value: string | Array<undefined | string> } | { key: string; value: string | Array<undefined | string> }[] | undefined } - The parsed data
 */
export function CustomParser(
    key: string,
    value: string,
    length: number,
    many: boolean,
    split: 'normal' | 'emoji' | 'none' = 'none'
): CustomParserResult {
    const input = value.mustEscape();
    if (many) {
        const matched = matchStructure(input)
            .map((match) => {
                const [matchedKey, matchedValue = ''] = keyValue(match);
                return {
                    key: matchedKey,
                    value: splitType(matchedValue, split)
                };
            })
            .filter((v) => v.key.toLowerCase() === key.toLowerCase());

        if (matched.length === 0) return void 0;
        return matched;
    }

    const [matchedKey, matchedValue] = keyValue(matchStructure(value)[0]);
    if (matchedKey.toLowerCase() !== key.toLowerCase()) return void 0;
    return {
        key: matchedKey,
        value: splitType(matchedValue, split)
    };

    function splitType(value: string, type: 'none' | 'normal' | 'emoji'): Array<string | undefined> | string {
        switch (type) {
            case 'none':
                return value;
            case 'normal':
            case 'emoji':
                return splitLengthParams(value, length, type);
            default:
                return value;
        }
    }
}

/**
 * A function to parse the embed data from the input and return the parsed embed
 *
 * @param {Interpreter} _ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Discord.EmbedBuilder} - The parsed embed
 * @example {newEmbed:
 *     {description:string}
 *     {title:string}
 *     {url:string}
 *     {color:color}
 *     {footer:string:iconURL?}
 *     {image:url}
 *     {thumbnail:url}
 *     {author:string:iconURL?}
 *     {field:title?:value:inline?}
 *     {timestamp:time?}
 *     {footerIcon:iconURL}
 *     {authorIcon:iconURL}
 *     {authorURL:url}
 * }
 */
function EmbedParser(_ctx: Interpreter, content: string): Discord.APIEmbed {
    const embedData: Discord.APIEmbed = {};

    for (const part of matchStructure(content)) {
        const [key, rawValue] = keyValue(part);
        const value = rawValue.unescape();

        switch (key) {
            case 'title':
                embedData.title = value;
                continue;
            case 'url':
                embedData.url = value;
                continue;
            case 'description':
                embedData.description = value;
                continue;
            case 'color':
                embedData.color = Discord.resolveColor(value as Discord.ColorResolvable);
                continue;
            case 'footericon':
                embedData.footer ??= { text: '\u200B' };
                embedData.footer.icon_url = value;
                continue;
            case 'image':
                embedData.image ??= { url: '' };
                embedData.image.url = value;
                continue;
            case 'thumbnail':
                embedData.thumbnail ??= { url: '' };
                embedData.thumbnail.url = value;
                continue;
            case 'authoricon':
                embedData.author ??= { name: '\u200B' };
                embedData.author.icon_url = value;
                continue;
            case 'authorurl':
                embedData.author ??= { name: '\u200B' };
                embedData.author.url = value;
                continue;
            case 'footer': {
                const [text = '\u200B', iconURL] = splitEscaped(rawValue);
                embedData.footer = { text };
                if (iconURL) embedData.footer.icon_url = iconURL;
                continue;
            }
            case 'author': {
                const [name = '\u200B', iconURL] = splitEscaped(rawValue);
                embedData.author = { name };
                if (iconURL) embedData.author.icon_url = iconURL;
                continue;
            }
            case 'field': {
                const [name = '\u200B', value = '\u200B', inline = 'false'] = splitEscaped(rawValue);
                embedData.fields ??= [];
                if (embedData.fields.length < 25) {
                    embedData.fields.push({
                        name,
                        value,
                        inline: inline.toLowerCase() === 'true'
                    });
                }
                continue;
            }
            case 'timestamp':
                embedData.timestamp = (value !== '' ? Number.parseInt(value) : Date.now()) as any as string;
        }
    }

    return embedData;
}

/**
 * A function to parse the action row data from the input and return the parsed action row
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Promise<Discord.ActionRowBuilder | null>} - The parsed action row
 * @example {actionRow:
 *     {button:label:style:customId:disabled?:emoji?}
 *     {selectMenu:customId:placeholder:minValues?:maxValues?:disabled?:(read select menu options below)}
 * }
 *
 *     * Select Menu Options:
 *         {stringInput:label:value:description?:default?:emoji?}
 *         {userInput}
 *         {roleInput}
 *         {mentionableInput}
 *         {channelInput:channelType?}
 */
async function ActionRowParser(
    ctx: Interpreter,
    content: string
): Promise<Discord.APIActionRowComponent<Discord.APIComponentInActionRow> | null> {
    const components: Array<SelectMenuTypes | Discord.APIButtonComponent> = [];
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);

        /**
         * BUTTON PARSER
         * {button:label:style:customId:disabled?:emoji?}
         */
        if (key === 'button') {
            const button = await parseButton(ctx, rawValue);
            if (button) components.push(button);
        } else if (key === 'selectmenu') {
            const selectMenu = await SelectMenuParser(ctx, rawValue);
            if (selectMenu) components.push(selectMenu);
        }
    }

    if (components.length === 0) return null;
    return {
        type: Discord.ComponentType.ActionRow,
        components
    };
}

/**
 * A function to parse the select menu data from the input and return the parsed select menu
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} rawValue - The content to parse
 * @return {Promise<SelectMenuTypes | null>} - The parsed select menu
 * @example {selectMenu:customId:placeholder:minValues?:maxValues?:disabled?:(read select menu options below)}
 *
 *     * Select Menu Options:
 *         {stringInput:label:value:description?:default?:emoji?}
 *         {userInput}
 *         {roleInput}
 *         {mentionableInput}
 *         {channelInput:channelType?}
 */
async function SelectMenuParser(ctx: Interpreter, rawValue: string): Promise<SelectMenuTypes | null> {
    const [customId, placeholder, minValues = '0', maxValues = '1', disabled = 'false'] = splitEscaped(rawValue);
    if (!customId || !minValues || !maxValues) return null;
    const stringInputMatches: RegExpExecArray[] = [...rawValue.matchAll(/\{stringInput:([^}]+)\}/gim)];
    let SelectMenu: SelectMenuTypes | null = null;
    const value = rawValue.unescape();

    /**
     * String Input Parser
     * {stringInput:label:value:description?:default?:emoji?}
     */
    if (stringInputMatches.length) {
        const options: (Discord.APISelectMenuOption | null)[] = await Promise.all(
            stringInputMatches.map(async (match) => {
                const [label, value, description, isDefault = 'false', emojiInput] = splitLengthParams(
                    match[1],
                    4,
                    'emoji'
                );
                if (!label || !value) return null;
                const emoji = emojiInput ? ((await ctx.util.getEmoji(ctx, emojiInput)) ?? emojiInput) : undefined;

                return {
                    label,
                    value,
                    default: isDefault.toLowerCase() === 'true',
                    emoji: emoji ?? void 0,
                    description: description ?? void 0
                } as Discord.APISelectMenuOption;
            })
        );

        SelectMenu = {
            type: Discord.ComponentType.StringSelect,
            custom_id: customId,
            options: options.filter(Boolean) as Discord.APISelectMenuOption[]
        };
    } else {
        const selectTypeMatch = value.match(/\{(userInput|roleInput|mentionableInput|channelInput(?::[^}]+)?)\}/im);
        if (!selectTypeMatch) return null;
        const typeStr = selectTypeMatch[1].toLowerCase();

        switch (true) {
            /**
             * User Input Parser
             * {userInput}
             */
            case typeStr === 'userinput': {
                SelectMenu = {
                    type: Discord.ComponentType.UserSelect,
                    custom_id: customId
                };
                break;
            }

            /**
             * Role Input Parser
             * {roleInput}
             */
            case typeStr === 'roleinput': {
                SelectMenu = {
                    type: Discord.ComponentType.RoleSelect,
                    custom_id: customId
                };
                break;
            }

            /**
             * Mentionable Input Parser
             * {mentionableInput}
             */
            case typeStr === 'mentionableinput': {
                SelectMenu = {
                    type: Discord.ComponentType.MentionableSelect,
                    custom_id: customId
                };
                break;
            }

            /**
             * Channel Input Parser
             * {channelInput:channelType?}
             */
            case typeStr.startsWith('channelinput'): {
                const [typeParam] = splitEscaped(typeStr.replace('channelinput:', ''));
                let types: number[] | undefined;

                switch (typeParam) {
                    case 'text':
                    case '0':
                        types = [0];
                        break;
                    case 'voice':
                    case '2':
                        types = [2];
                        break;
                    default:
                        types = undefined;
                }

                SelectMenu = {
                    type: Discord.ComponentType.ChannelSelect,
                    custom_id: customId,
                    channel_types: types
                };
                break;
            }
        }
    }

    return {
        ...SelectMenu,
        placeholder,
        min_values: Number.parseInt(minValues),
        max_values: Number.parseInt(maxValues)
    } as SelectMenuTypes;
}

/**
 * A function to parse the modal data from the input and return the parsed modal
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Promise<Discord.APIModalInteractionResponseCallbackData>} - The parsed modal
 * @example {modal:
 *     {title:string}
 *     {customId:string}
 *     {textInput:customId:label:style:placeholder?:minLength?:maxLength?:required?:value?}
 *     {textDisplay:content}
 *     {label:label:description?:(read label options below)}
 * }
 *
 *     * Label Options:
 *         {textInput:customId:label:style:placeholder?:minLength?:maxLength?:required?:value?}
 *         {selectMenu:customId:placeholder:minValues?:maxValues?:disabled?:(read select menu options above)
 */
async function ModalParser(
    ctx: Interpreter,
    content: string
): Promise<Discord.APIModalInteractionResponseCallbackData> {
    const builder = new Discord.ModalBuilder();
    const title = content.match(/\{title:([^}]+)\}/im)?.[1]?.unescape() ?? 'Modal';
    const customId = content.match(/\{customId:([^}]+)\}/im)?.[1]?.unescape() ?? 'modal';

    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const Value = rawValue.unescape();

        if (key === 'textinput') {
            const [
                customId,
                label,
                style,
                description,
                placeholder,
                minLength = '0',
                maxLength = '4000',
                required = 'false',
                value = ''
            ] = splitEscaped(Value);
            if (!customId || !label || !style) continue;
            builder.addLabelComponents(
                new Discord.LabelBuilder()
                    .setLabel(label)
                    .setDescription(description ?? '')
                    .setTextInputComponent(
                        new Discord.TextInputBuilder()
                            .setCustomId(customId)
                            .setStyle(
                                style === 'short' ? Discord.TextInputStyle.Short : Discord.TextInputStyle.Paragraph
                            )
                            .setPlaceholder(placeholder ?? '')
                            .setMinLength(Number.parseInt(minLength))
                            .setMaxLength(Number.parseInt(maxLength))
                            .setRequired(required.toLowerCase() === 'true')
                            .setValue(value)
                    )
            );
        } else if (key === 'textdisplay' || key === 'text') {
            builder.addTextDisplayComponents(new Discord.TextDisplayBuilder().setContent(Value));
        } else if (key === 'fileupload' || key === 'file') {
            const [customId, label, description, minValue, maxValue, required = 'false'] = splitEscaped(Value);
            if (!customId || !label) continue;

            builder.addLabelComponents(
                new Discord.LabelBuilder()
                    .setLabel(label)
                    .setDescription(description ?? '')
                    .setFileUploadComponent(
                        new Discord.FileUploadBuilder()
                            .setCustomId(customId)
                            .setMinValues(minValue ? Number.parseInt(minValue) : 0)
                            .setMaxValues(maxValue ? Number.parseInt(maxValue) : 5)
                            .setRequired(required.toLowerCase() === 'true')
                    )
            );
        } else if (key === 'label') {
            const [label, description, ...rest] = splitEscaped(Value);
            if (!label) continue;
            const labelBuilder = new Discord.LabelBuilder().setLabel(label).setDescription(description ?? '');
            for (const match of matchStructure(rest.join(':'))) {
                const [key, rawValue] = keyValue(match);
                const Value = rawValue.unescape();

                if (key === 'textinput') {
                    const [
                        customId,
                        label,
                        style,
                        placeholder,
                        minLength = '0',
                        maxLength = '4000',
                        required = 'false',
                        value = ''
                    ] = splitEscaped(Value);
                    if (!customId || !label || !style) continue;
                    labelBuilder.setTextInputComponent(
                        new Discord.TextInputBuilder()
                            .setCustomId(customId)
                            .setStyle(
                                style === 'short' ? Discord.TextInputStyle.Short : Discord.TextInputStyle.Paragraph
                            )
                            .setPlaceholder(placeholder ?? '')
                            .setMinLength(Number.parseInt(minLength))
                            .setMaxLength(Number.parseInt(maxLength))
                            .setRequired(required.toLowerCase() === 'true')
                            .setValue(value)
                    );

                    break;
                }
                if (key === 'selectmenu') {
                    const selectMenu = await SelectMenuParser(ctx, rawValue);
                    if (!selectMenu) continue;
                    switch (selectMenu.type) {
                        case Discord.ComponentType.StringSelect:
                            labelBuilder.setStringSelectMenuComponent(selectMenu);
                            break;
                        case Discord.ComponentType.UserSelect:
                            labelBuilder.setUserSelectMenuComponent(selectMenu);
                            break;
                        case Discord.ComponentType.RoleSelect:
                            labelBuilder.setRoleSelectMenuComponent(selectMenu);
                            break;
                        case Discord.ComponentType.MentionableSelect:
                            labelBuilder.setMentionableSelectMenuComponent(selectMenu);
                            break;
                        case Discord.ComponentType.ChannelSelect:
                            labelBuilder.setChannelSelectMenuComponent(selectMenu);
                    }
                    break;
                }
                if (key === 'fileupload' || key === 'file') {
                    const [customId, minValue, maxValue, required = 'false'] = splitEscaped(Value);
                    if (!customId || !label) continue;
                    labelBuilder.setFileUploadComponent(
                        new Discord.FileUploadBuilder()
                            .setCustomId(customId)
                            .setMinValues(minValue ? Number.parseInt(minValue) : 0)
                            .setMaxValues(maxValue ? Number.parseInt(maxValue) : 5)
                            .setRequired(required.toLowerCase() === 'true')
                    );
                    break;
                }
            }

            builder.addLabelComponents(labelBuilder);
        }
    }

    return builder.setTitle(title).setCustomId(customId).toJSON();
}

/**
 * A function to parse the attachment data from the input and return the parsed attachment
 *
 * @param {Interpreter} _ctx - The context of the interpreter
 * @param {string} rawContent - The content to parse
 * @param {'attachment' | 'file'} [type] - The type of attachment
 * @return {Discord.AttachmentBuilder | null} - The parsed attachment
 * @example {attachment:name:url}
 * {attachment:name:location}
 * {file:name:content}
 */
function AttachmentParser(
    _ctx: Interpreter,
    rawContent: string,
    type: 'attachment' | 'file' = 'attachment'
): unknown | null {
    if (type === 'attachment') {
        const [name = 'attachment.png', url] = splitEscaped(rawContent);
        if (!url) return null;
        return new Discord.AttachmentBuilder(url, { name }).toJSON();
    }

    const [name = 'file.txt', content] = splitLengthParams(rawContent, 1, 'normal');
    if (!content) return null;
    const buffer = Buffer.from(content);
    return new Discord.AttachmentBuilder(buffer, { name }).toJSON();
}

/**
 * A function to parse the flags data from the input and return the parsed flags
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} rawContent - The content to parse
 * @param {'flags' | 'flag'} [type] - The type of flag
 * @return {Array<Discord.MessageFlags | null>} - The parsed flags
 * @example {flags:flag1:flag2:flag3}
 * {flag:flag}
 */
function FlagsParser(
    ctx: Interpreter,
    rawContent: string,
    type: 'flags' | 'flag' = 'flags'
): Array<Discord.MessageFlags | null> {
    if (type === 'flag') {
        const rawFlag = rawContent.unescape().trim().toLowerCase();
        const flag = Number.isNaN(rawFlag) ? ctx.util.Flags[rawFlag] : Number.parseInt(rawFlag);
        return [flag ?? null].filter(Boolean) as Array<Discord.MessageFlags | null>;
    }

    const rawFlags = splitEscaped(rawContent);
    return rawFlags
        .map((flag) => {
            if (!flag) return null;
            return (Number.isNaN(flag) ? ctx.util.Flags[flag.toLowerCase()] : Number.parseInt(flag)) ?? null;
        })
        .filter(Boolean) as Array<Discord.MessageFlags | null>;
}

/**
 * A function to parse the poll data from the input and return the parsed poll
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} rawContent - The content to parse
 * @return {Promise<Discord.PollData | null>} - The parsed poll
 * @example {poll:question:duration:multiSelect:(read answer options below)}
 *
 *     * Answer Options Parser:
 *         {answer:text:emoji?}
 */
async function PollParser(ctx: Interpreter, rawContent: string): Promise<Discord.PollData | null> {
    const content = rawContent;
    const answerRegex = /{answer:([^}]+)}/gim;
    const [question, durationRaw, multiSelect = 'false'] = splitEscaped(content);
    if (!question || !durationRaw) return null;
    const duration = ctx.helpers.time.parse(durationRaw)?.ms ?? 86400000;

    const answers: Array<{ text: string; emoji?: string }> = [];
    const matches: RegExpExecArray[] = [...content.matchAll(answerRegex)];
    for (const match of matches) {
        const [text, emoji] = splitLengthParams(match[1], 1, 'emoji');
        if (!text) continue;
        const emojiResolved = emoji ? ((await ctx.util.getEmoji(ctx, emoji))?.name ?? emoji) : void 0;
        answers.push({ text, emoji: emojiResolved });
    }

    if (answers.filter(Boolean).length === 0) return null;
    return {
        question: { text: question },
        duration: Number.parseInt((duration / (1000 * 60 * 60)).toFixed()),
        allowMultiselect: multiSelect.toLowerCase() === 'true',
        layoutType: 1,
        answers
    };
}

/**
 * A function to parse the components v2 data from the input and return the parsed components
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Promise<Discord.APIContainerComponent>} - The parsed components
 * @example {newContainer:
 *     {color:color}
 *     {spoiler:boolean}
 *     {actionRow:(read actionRow parser above)}
 *     {separator:divider?:spacing?}
 *     {text:content}
 *     {section:(read section parser below)}
 *     {newSection:(read section parser below)}
 *     {file:name:spoiler?}
 *     {gallery:(read gallery parser below)}
 * }
 *
 *     * Section Parser:
 *         {text:content}
 *         {thumbnail:url:spoiler?:description?}
 *         {button:(read button parser above)}
 *
 *     * Gallery Parser:
 *         {media:url:spoiler?:description?}
 * */
async function ComponentsV2Parser(ctx: Interpreter, content: string): Promise<Discord.APIContainerComponent> {
    const container: Discord.APIContainerComponent = {
        type: Discord.ComponentType.Container,
        components: [],
        accent_color: null,
        spoiler: false
    };

    const color = parseColorV2(ctx, content);
    const spoiler = parseSpoilerV2(ctx, content) ?? false;
    if (spoiler) container.spoiler = spoiler;
    if (color) container.accent_color = color;

    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();

        switch (key) {
            /**
             * SEPARATOR PARSER
             * {separator:divider?:spacing?}
             */
            case 'separator':
                container.components.push(parseSeparatorV2(ctx, rawValue));
                continue;

            /**
             * GALLERY PARSER
             * {gallery:(read gallery parser above)}
             */
            case 'gallery':
                container.components.push(parseGalleryV2(ctx, rawValue));
                continue;

            /**
             * ACTION ROW PARSER
             * {actionRow:(read actionRow parser above)}
             */
            case 'actionrow': {
                const row = await ActionRowParser(ctx, rawValue);
                if (row)
                    container.components.push(
                        row as Discord.APIActionRowComponent<Discord.APIComponentInMessageActionRow>
                    );
                continue;
            }

            /**
             * TEXT AND SECTION PARSER
             * {text:content}
             * {section:(read section parser above)}
             */
            case 'text':
            case 'section':
            case 'newsection': {
                if (key === 'text') {
                    container.components.push({
                        type: Discord.ComponentType.TextDisplay,
                        content: value
                    });
                    continue;
                }

                container.components.push(await parseSectionV2(ctx, rawValue));
                continue;
            }

            /**
             * FILE PARSER
             * {file:name:spoiler?}
             */
            case 'file': {
                const [url, spoiler = 'false'] = splitEscaped(rawValue);
                if (!url) continue;
                container.components.push({
                    type: Discord.ComponentType.File,
                    file: { url },
                    spoiler: spoiler.toLowerCase() === 'true'
                });
                continue;
            }
        }
    }

    return container;
}

/**
 * A function to parse the color data from the input and return the parsed color
 *
 * @param {Interpreter} _ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {number} - The parsed color
 */
function parseColorV2(_ctx: Interpreter, content: string): number {
    const colorRegex = /{color:([^}]+)}/gim;
    const match = colorRegex.exec(content);
    if (!match) return 0;
    const color = match[1]?.unescape().trim();
    return Discord.resolveColor(color as Discord.ColorResolvable);
}

/**
 * A function to parse the spoiler data from the input and return the parsed spoiler
 *
 * @param {Interpreter} _ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {boolean} - The parsed spoiler
 */
function parseSpoilerV2(_ctx: Interpreter, content: string): boolean {
    const spoilerRegex = /{spoiler:([^}]+)}/gim;
    const match = spoilerRegex.exec(content);
    if (!match) return false;
    const spoiler = match[1]?.unescape().trim().toLowerCase();
    return spoiler === 'true';
}

/**
 * A function to parse the separator data from the input and return the parsed separator
 *
 * @param {Interpreter} _ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Discord.APISeparatorComponent} - The parsed separator
 */
function parseSeparatorV2(_ctx: Interpreter, content: string): Discord.APISeparatorComponent {
    const [divider = 'true', rawSpacing = 'small'] = splitEscaped(content);
    let spacing: Discord.SeparatorSpacingSize | undefined = void 0;

    switch (rawSpacing.toLowerCase()) {
        case 'small':
        case '1':
            spacing = Discord.SeparatorSpacingSize.Small;
            break;
        case 'large':
        case '2':
            spacing = Discord.SeparatorSpacingSize.Large;
            break;
    }

    return {
        type: Discord.ComponentType.Separator,
        divider: divider.toLowerCase() === 'true',
        spacing
    };
}

/**
 * A function to parse the section data from the input and return the parsed section
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Promise<Discord.APISectionComponent>} - The parsed section
 */
async function parseSectionV2(ctx: Interpreter, content: string): Promise<Discord.APISectionComponent> {
    const section: Discord.APISectionComponent = {
        type: Discord.ComponentType.Section,
        components: [],
        accessory: null as any
    };

    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();

        switch (key) {
            case 'text': {
                if (!value || value === '') continue;
                section.components.push({
                    type: Discord.ComponentType.TextDisplay,
                    content: value
                });
                continue;
            }
            case 'thumbnail': {
                const [url, spoiler = 'false', description] = splitEscaped(rawValue);
                if (!url) continue;
                section.accessory = {
                    type: Discord.ComponentType.Thumbnail,
                    media: { url },
                    spoiler: spoiler.toLowerCase() === 'true',
                    description
                };
                continue;
            }
            case 'button': {
                const button = await parseButton(ctx, rawValue);
                if (button) section.accessory = button;
            }
        }
    }

    return section;
}

/**
 * A function to parse the gallery data from the input and return the parsed gallery
 *
 * @param {Interpreter} _ctx - The context of the interpreter
 * @param {string} rawContent - The content to parse
 * @return {Discord.APIMediaGalleryComponent} - The parsed gallery
 */
function parseGalleryV2(_ctx: Interpreter, rawContent: string): Discord.APIMediaGalleryComponent {
    const content = rawContent;
    const mediaRegex = /{media:([^}]+)}/gim;
    const matches = [...content.matchAll(mediaRegex)];
    const media: Discord.APIMediaGalleryComponent = {
        type: Discord.ComponentType.MediaGallery,
        items: []
    };

    for (const match of matches) {
        const [url, spoiler = 'false', description] = splitLengthParams(match[1], 2, 'normal');
        if (!url) continue;

        media.items.push({
            media: { url },
            spoiler: spoiler.toLowerCase() === 'true',
            description
        });
    }

    return media;
}

/**
 * A function to parse the button data from the input and return the parsed button
 *
 * @param {Interpreter} ctx - The context of the interpreter
 * @param {string} content - The content to parse
 * @return {Promise<Discord.ButtonBuilder | undefined>} - The parsed button
 */
async function parseButton(ctx: Interpreter, content: string): Promise<Discord.APIButtonComponent | undefined> {
    const [label, styleStr, custom_id, disabled = 'false', emojiInput] = splitLengthParams(content, 4, 'emoji');
    if (!styleStr || !custom_id) return void 0;
    const emoji = emojiInput ? ((await ctx.util.getEmoji(ctx, emojiInput)) ?? emojiInput) : undefined;
    let style: Discord.ButtonStyle | null = null;

    switch (styleStr.toLowerCase()) {
        case 'primary':
        case '1':
            style = Discord.ButtonStyle.Primary;
            break;
        case 'secondary':
        case '2':
            style = Discord.ButtonStyle.Secondary;
            break;
        case 'success':
        case '3':
            style = Discord.ButtonStyle.Success;
            break;
        case 'danger':
        case '4':
            style = Discord.ButtonStyle.Danger;
            break;
        case 'link':
        case '5':
            style = Discord.ButtonStyle.Link;
            break;
        case 'premium':
        case '6':
            style = Discord.ButtonStyle.Premium;
            break;
        default:
            return void 0;
    }

    if (style === Discord.ButtonStyle.Link) {
        return {
            type: Discord.ComponentType.Button,
            label,
            style,
            url: custom_id,
            disabled: disabled.toLowerCase() === 'true',
            emoji
        } as Discord.APIButtonComponentWithURL;
    }
    if (style === Discord.ButtonStyle.Premium) {
        return {
            type: Discord.ComponentType.Button,
            style,
            sku_id: custom_id,
            disabled: disabled.toLowerCase() === 'true'
        } as Discord.APIButtonComponentWithSKUId;
    }
    return {
        type: Discord.ComponentType.Button,
        label,
        style,
        custom_id,
        disabled: disabled.toLowerCase() === 'true',
        emoji
    } as Discord.APIButtonComponentWithCustomId;
}

/**
 * A function to match the structure of the input and return the matched structure
 *
 * @param {string} input - The input to match
 * @return {Array<[string, string, string]>} - The matched structure
 */
function matchStructure(input: string): Array<[string, string, string]> {
    const processParser = (rawContent: string): Array<[string, string, string]> => {
        let content = rawContent;
        let start = -1;
        let end = -1;
        let depth = 0;
        const result: Array<[string, string, string]> = [];

        for (let i = 0; i < content.length; i++) {
            if (content[i] === '{') {
                if (depth === 0) start = i;
                depth++;
            } else if (content[i] === '}') {
                depth--;
                if (depth === 0) {
                    end = i + 1;
                    break;
                }
            }
        }

        if (start === -1 || end === -1) return [];

        const objectContent = content.substring(start, end);
        const objectBody = content.substring(start + 1, end - 1).trim();
        const index = objectBody.indexOf(':');
        const key = objectBody.slice(0, index).trim();
        const value = objectBody.slice(index + 1).trim();

        content = content.replace(objectContent, '').trim();
        result.push([objectContent, key, value ?? '']);
        if (content.includes('{')) {
            const nestedResult = processParser(content);
            if (nestedResult) {
                result.push(...nestedResult);
            }
        }

        return result.filter(Boolean);
    };

    return processParser(input);
}

/**
 * A function to parse the key value from the input and return the parsed key value
 *
 * @param {Array<string>} match - The match to parse
 * @return {Array<string>} - The parsed key value
 */
function keyValue(match: [string, string, string]): [string, string] {
    return [match[1]?.toLowerCase().trim(), match[2].trim()];
}

/**
 * A function to split the escaped value from the input and return the splitted value
 *
 * @param {string} value - The value to split
 * @return {Array<string | undefined>} - The splitted value
 */
function splitEscaped(value: string): Array<string | undefined> {
    return value.split(/:(?![/][/])/gim).map((v) => {
        const text = v.unescape().trim();
        if (text === '') return void 0;
        return text;
    });
}

/**
 * A function to split the escaped emoji from the input and return the splitted value
 *
 * @param {string} value - The value to split
 * @return {Array<string | undefined>} - The splitted value
 */
function splitEscapedEmoji(value: string): Array<string | undefined> {
    return value.split(/:(?![^<]*?>)/gim).map((v) => {
        const text = v.unescape().trim();
        if (text === '') return void 0;
        return text;
    });
}

/**
 * A function to split the length params from the input and return the splitted value
 *
 * @param {string} value - The value to split
 * @param {number} [length] - The length to split
 * @param {'emoji' | 'normal'} [type] - The type to split
 * @return {Array<string | undefined>} - The splitted value
 */
function splitLengthParams(value: string, length = 1, type: 'emoji' | 'normal' = 'normal'): Array<string | undefined> {
    const splited = type === 'emoji' ? splitEscapedEmoji(value) : splitEscaped(value);
    const result: Array<string | undefined> = [];
    for (let i = 0; i < length; i++) {
        result.push(splited[i]);
    }

    result.push(splited.slice(length).join(':'));
    return result;
}

/**
 * A function to build the result data from the input and return the built result
 *
 * @param {ParserData} data - The data to build
 * @param {Interpreter} ctx - The context of the interpreter
 * @return {SendData} - The built result
 */
function buildResult(
    { embeds, components, modal, content, attachments, flags, poll, stickers, reply, allowedMentions }: ParserData,
    ctx: Interpreter
): SendData {
    const isComponentsV2 = flags.filter(Boolean).includes(ctx.util.Flags.iscomponentsv2 as Discord.MessageFlags);
    const parsed = JSON.parse(
        JSON.stringify({
            embeds: isComponentsV2 ? null : embeds.filter(Boolean),
            components: components.filter(Boolean) as any as Discord.TopLevelComponent[],
            content: isComponentsV2 ? null : content?.unescape().trim() === '' ? null : content?.unescape().trim(),
            poll: (isComponentsV2 ? null : poll) ?? null
        }).replace(/\$executionTime/gi, () => (performance.now() - ctx.start).toFixed(2).toString())
    );

    return {
        ...parsed,
        files: attachments.filter(Boolean) as Discord.AttachmentBuilder[],
        flags: flags.filter(Boolean) as Flags,
        stickers: isComponentsV2 ? null : (stickers.filter(Boolean) as Discord.StickerResolvable[]),
        reply,
        allowedMentions,
        modal
    };
}
