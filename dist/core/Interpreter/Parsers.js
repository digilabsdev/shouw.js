"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = Parser;
exports.CustomParser = CustomParser;
const Discord = __importStar(require("discord.js"));
async function Parser(ctx, input) {
    const embeds = [];
    const components = [];
    const attachments = [];
    const flags = [];
    const stickers = [];
    let poll = null;
    let content = input.mustEscape();
    let isParsed = false;
    let reply = void 0;
    const allowedMentions = {
        parse: ['users', 'roles', 'everyone'],
        repliedUser: true
    };
    for (const match of matchStructure(content)) {
        const [key, value] = keyValue(match);
        if (key === 'newembed') {
            embeds.push(EmbedParser(ctx, value));
            isParsed = true;
        }
        else if (key === 'actionrow') {
            components.push(await ActionRowParser(ctx, value));
            isParsed = true;
        }
        else if (key === 'attachment' || key === 'file') {
            attachments.push(AttachmentParser(ctx, value, key));
            isParsed = true;
        }
        else if (key === 'flags' || key === 'flag') {
            flags.push(...FlagsParser(ctx, value, key));
            isParsed = true;
        }
        else if (key === 'poll') {
            poll = await PollParser(ctx, value);
            isParsed = true;
        }
        else if (key === 'newcontainer' || key === 'container') {
            components.push(await ComponentsV2Parser(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'text') {
            components.push({
                type: Discord.ComponentType.TextDisplay,
                content: value.unescape()
            });
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'section' || key === 'newsection') {
            components.push(await parseSectionV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'separator') {
            components.push(parseSeparatorV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'gallery') {
            components.push(parseGalleryV2(ctx, value));
            flags.push(ctx.util.Flags.iscomponentsv2);
            isParsed = true;
        }
        else if (key === 'allowedmentions') {
            allowedMentions.parse = splitEscaped(value.toLowerCase()).filter((a) => {
                return ['users', 'roles', 'everyone'].includes(a);
            });
            isParsed = true;
        }
        else if (key === 'reply') {
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
    return buildResult({
        embeds,
        components,
        content,
        attachments,
        flags,
        poll,
        stickers,
        reply,
        allowedMentions
    }, ctx);
}
function CustomParser(key, value, length, many, split = 'none') {
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
        if (matched.length === 0)
            return void 0;
        return matched;
    }
    const [matchedKey, matchedValue] = keyValue(matchStructure(value)[0]);
    if (matchedKey.toLowerCase() !== key.toLowerCase())
        return void 0;
    return {
        key: matchedKey,
        value: splitType(matchedValue, split)
    };
    function splitType(value, type) {
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
function EmbedParser(_ctx, content) {
    const embedData = {};
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
                embedData.color = Discord.resolveColor(value);
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
                if (iconURL)
                    embedData.footer.icon_url = iconURL;
                continue;
            }
            case 'author': {
                const [name = '\u200B', iconURL] = splitEscaped(rawValue);
                embedData.author = { name };
                if (iconURL)
                    embedData.author.icon_url = iconURL;
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
                embedData.timestamp = (value !== '' ? Number.parseInt(value) : Date.now());
        }
    }
    return embedData;
}
async function ActionRowParser(ctx, content) {
    const components = [];
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        if (key === 'button') {
            const button = await parseButton(ctx, rawValue);
            if (button)
                components.push(button);
        }
        else if (key === 'selectmenu') {
            const [customId, placeholder, minValues = '0', maxValues = '1', disabled = 'false'] = splitEscaped(rawValue);
            if (!customId || !minValues || !maxValues)
                continue;
            const stringInputMatches = [...rawValue.matchAll(/\{stringInput:([^}]+)\}/gim)];
            let SelectMenu = null;
            if (stringInputMatches.length) {
                const options = await Promise.all(stringInputMatches.map(async (match) => {
                    const [label, value, description, isDefault = 'false', emojiInput] = splitLengthParams(match[1], 4, 'emoji');
                    if (!label || !value)
                        return null;
                    const emoji = emojiInput
                        ? ((await ctx.util.getEmoji(ctx, emojiInput)) ?? emojiInput)
                        : undefined;
                    return {
                        label,
                        value,
                        default: isDefault.toLowerCase() === 'true',
                        emoji: emoji ?? void 0,
                        description: description ?? void 0
                    };
                }));
                SelectMenu = {
                    type: Discord.ComponentType.StringSelect,
                    custom_id: customId,
                    options: options.filter(Boolean)
                };
            }
            else {
                const selectTypeMatch = value.match(/\{(userInput|roleInput|mentionableInput|channelInput(?::[^}]+)?)\}/im);
                if (!selectTypeMatch)
                    continue;
                const typeStr = selectTypeMatch[1].toLowerCase();
                switch (true) {
                    case typeStr === 'userinput': {
                        SelectMenu = {
                            type: Discord.ComponentType.UserSelect,
                            custom_id: customId
                        };
                        break;
                    }
                    case typeStr === 'roleinput': {
                        SelectMenu = {
                            type: Discord.ComponentType.RoleSelect,
                            custom_id: customId
                        };
                        break;
                    }
                    case typeStr === 'mentionableinput': {
                        SelectMenu = {
                            type: Discord.ComponentType.MentionableSelect,
                            custom_id: customId
                        };
                        break;
                    }
                    case typeStr.startsWith('channelinput'): {
                        const [typeParam] = splitEscaped(typeStr.replace('channelinput:', ''));
                        let types;
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
            if (SelectMenu) {
                components.push({
                    ...SelectMenu,
                    min_values: Number.parseInt(minValues),
                    max_values: Number.parseInt(maxValues),
                    disabled: disabled.toLowerCase() === 'true',
                    placeholder: placeholder ?? void 0
                });
            }
        }
        else if (key === 'textinput' || key === 'modal') {
            const [label, styleStr, customId, required = 'false', placeholder, minLength, maxLength, value] = splitEscapedEmoji(rawValue);
            if (!label || !styleStr || !customId)
                continue;
            let style = null;
            switch ((styleStr ?? '').toLowerCase()) {
                case 'short':
                case '1':
                    style = Discord.TextInputStyle.Short;
                    break;
                case 'paragraph':
                case '2':
                    style = Discord.TextInputStyle.Paragraph;
                    break;
                default:
                    continue;
            }
            components.push({
                type: Discord.ComponentType.TextInput,
                label,
                style,
                value,
                custom_id: customId,
                required: required.toLowerCase() === 'true',
                placeholder: placeholder ?? void 0,
                min_length: minLength ? Number.parseInt(minLength) : void 0,
                max_length: maxLength ? Number.parseInt(maxLength) : void 0
            });
        }
    }
    if (components.length === 0)
        return null;
    return {
        type: Discord.ComponentType.ActionRow,
        components
    };
}
function AttachmentParser(_ctx, rawContent, type = 'attachment') {
    if (type === 'attachment') {
        const [name = 'attachment.png', url] = splitEscaped(rawContent);
        if (!url)
            return null;
        return new Discord.AttachmentBuilder(url, { name }).toJSON();
    }
    const [name = 'file.txt', content] = splitLengthParams(rawContent, 1, 'normal');
    if (!content)
        return null;
    const buffer = Buffer.from(content);
    return new Discord.AttachmentBuilder(buffer, { name }).toJSON();
}
function FlagsParser(ctx, rawContent, type = 'flags') {
    if (type === 'flag') {
        const rawFlag = rawContent.unescape().trim().toLowerCase();
        const flag = Number.isNaN(rawFlag) ? ctx.util.Flags[rawFlag] : Number.parseInt(rawFlag);
        return [flag ?? null].filter(Boolean);
    }
    const rawFlags = splitEscaped(rawContent);
    return rawFlags
        .map((flag) => {
        if (!flag)
            return null;
        return (Number.isNaN(flag) ? ctx.util.Flags[flag.toLowerCase()] : Number.parseInt(flag)) ?? null;
    })
        .filter(Boolean);
}
async function PollParser(ctx, rawContent) {
    const content = rawContent;
    const answerRegex = /{answer:([^}]+)}/gim;
    const [question, durationRaw, multiSelect = 'false'] = splitEscaped(content);
    if (!question || !durationRaw)
        return null;
    const duration = ctx.helpers.time.parse(durationRaw)?.ms ?? 86400000;
    const answers = [];
    const matches = [...content.matchAll(answerRegex)];
    for (const match of matches) {
        const [text, emoji] = splitLengthParams(match[1], 1, 'emoji');
        if (!text)
            continue;
        const emojiResolved = emoji ? ((await ctx.util.getEmoji(ctx, emoji))?.name ?? emoji) : void 0;
        answers.push({ text, emoji: emojiResolved });
    }
    if (answers.filter(Boolean).length === 0)
        return null;
    return {
        question: { text: question },
        duration: Number.parseInt((duration / (1000 * 60 * 60)).toFixed()),
        allowMultiselect: multiSelect.toLowerCase() === 'true',
        layoutType: 1,
        answers
    };
}
async function ComponentsV2Parser(ctx, content) {
    const container = {
        type: Discord.ComponentType.Container,
        components: [],
        accent_color: null,
        spoiler: false
    };
    const color = parseColorV2(ctx, content);
    const spoiler = parseSpoilerV2(ctx, content) ?? false;
    if (spoiler)
        container.spoiler = spoiler;
    if (color)
        container.accent_color = color;
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        switch (key) {
            case 'separator':
                container.components.push(parseSeparatorV2(ctx, rawValue));
                continue;
            case 'gallery':
                container.components.push(parseGalleryV2(ctx, rawValue));
                continue;
            case 'actionrow': {
                const row = await ActionRowParser(ctx, rawValue);
                if (row)
                    container.components.push(row);
                continue;
            }
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
            case 'file': {
                const [url, spoiler = 'false'] = splitEscaped(rawValue);
                if (!url)
                    continue;
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
function parseColorV2(_ctx, content) {
    const colorRegex = /{color:([^}]+)}/gim;
    const match = colorRegex.exec(content);
    if (!match)
        return 0;
    const color = match[1]?.unescape().trim();
    return Discord.resolveColor(color);
}
function parseSpoilerV2(_ctx, content) {
    const spoilerRegex = /{spoiler:([^}]+)}/gim;
    const match = spoilerRegex.exec(content);
    if (!match)
        return false;
    const spoiler = match[1]?.unescape().trim().toLowerCase();
    return spoiler === 'true';
}
function parseSeparatorV2(_ctx, content) {
    const [divider = 'true', rawSpacing = 'small'] = splitEscaped(content);
    let spacing = void 0;
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
async function parseSectionV2(ctx, content) {
    const section = {
        type: Discord.ComponentType.Section,
        components: [],
        accessory: null
    };
    for (const match of matchStructure(content)) {
        const [key, rawValue] = keyValue(match);
        const value = rawValue.unescape();
        switch (key) {
            case 'text': {
                if (!value || value === '')
                    continue;
                section.components.push({
                    type: Discord.ComponentType.TextDisplay,
                    content: value
                });
                continue;
            }
            case 'thumbnail': {
                const [url, spoiler = 'false', description] = splitEscaped(rawValue);
                if (!url)
                    continue;
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
                if (button)
                    section.accessory = button;
            }
        }
    }
    return section;
}
function parseGalleryV2(_ctx, rawContent) {
    const content = rawContent;
    const mediaRegex = /{media:([^}]+)}/gim;
    const matches = [...content.matchAll(mediaRegex)];
    const media = {
        type: Discord.ComponentType.MediaGallery,
        items: []
    };
    for (const match of matches) {
        const [url, spoiler = 'false', description] = splitLengthParams(match[1], 2, 'normal');
        if (!url)
            continue;
        media.items.push({
            media: { url },
            spoiler: spoiler.toLowerCase() === 'true',
            description
        });
    }
    return media;
}
async function parseButton(ctx, content) {
    const [label, styleStr, custom_id, disabled = 'false', emojiInput] = splitLengthParams(content, 4, 'emoji');
    if (!styleStr || !custom_id)
        return void 0;
    const emoji = emojiInput ? ((await ctx.util.getEmoji(ctx, emojiInput)) ?? emojiInput) : undefined;
    let style = null;
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
        };
    }
    if (style === Discord.ButtonStyle.Premium) {
        return {
            type: Discord.ComponentType.Button,
            style,
            sku_id: custom_id,
            disabled: disabled.toLowerCase() === 'true'
        };
    }
    return {
        type: Discord.ComponentType.Button,
        label,
        style,
        custom_id,
        disabled: disabled.toLowerCase() === 'true',
        emoji
    };
}
function matchStructure(input) {
    const processParser = (rawContent) => {
        let content = rawContent;
        let start = -1;
        let end = -1;
        let depth = 0;
        const result = [];
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '{') {
                if (depth === 0)
                    start = i;
                depth++;
            }
            else if (content[i] === '}') {
                depth--;
                if (depth === 0) {
                    end = i + 1;
                    break;
                }
            }
        }
        if (start === -1 || end === -1)
            return [];
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
function keyValue(match) {
    return [match[1]?.toLowerCase().trim(), match[2].trim()];
}
function splitEscaped(value) {
    return value.split(/:(?![/][/])/gim).map((v) => {
        const text = v.unescape().trim();
        if (text === '')
            return void 0;
        return text;
    });
}
function splitEscapedEmoji(value) {
    return value.split(/:(?![^<]*?>)/gim).map((v) => {
        const text = v.unescape().trim();
        if (text === '')
            return void 0;
        return text;
    });
}
function splitLengthParams(value, length = 1, type = 'normal') {
    const splited = type === 'emoji' ? splitEscapedEmoji(value) : splitEscaped(value);
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(splited[i]);
    }
    result.push(splited.slice(length).join(':'));
    return result;
}
function buildResult({ embeds, components, content, attachments, flags, poll, stickers, reply, allowedMentions }, ctx) {
    const isComponentsV2 = flags.filter(Boolean).includes(ctx.util.Flags.iscomponentsv2);
    const parsed = JSON.parse(JSON.stringify({
        embeds: isComponentsV2 ? null : embeds.filter(Boolean),
        components: components.filter(Boolean),
        content: isComponentsV2 ? null : content?.unescape().trim() === '' ? null : content?.unescape().trim(),
        poll: (isComponentsV2 ? null : poll) ?? null
    }).replace(/\$executionTime/gi, () => (performance.now() - ctx.start).toFixed(2).toString()));
    return {
        ...parsed,
        files: attachments.filter(Boolean),
        flags: flags.filter(Boolean),
        stickers: isComponentsV2 ? null : stickers.filter(Boolean),
        reply,
        allowedMentions
    };
}
