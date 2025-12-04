"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const discord_js_1 = require("discord.js");
class Constants {
    static Version = require('../../package.json').version;
    static Errors = {
        build: (options, functionName, all = '') => {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            const header = functionName ? `${functionName}: ` : '';
            const codePreview = all && all.length <= 200 ? all : all ? 'Hmm... Code is too long to display.' : '';
            return [
                '```',
                `${header}🚫 ${message}`,
                solution
                    ? [codePreview && `\n${codePreview}`, `\nSuggested solution:\n${solution}`]
                        .filter(Boolean)
                        .join('\n')
                    : '',
                '```'
            ]
                .filter(Boolean)
                .join('\n');
        },
        buildLog: (options, all = '') => {
            const { message, solution } = typeof options === 'string' ? { message: options } : options;
            const codePreview = all && all.length <= 200 ? all : all ? 'Hmm... Code is too long to display.' : '';
            return [message, codePreview, solution && `${solution}`].filter(Boolean).join('\n\n');
        },
        missingBrackets: (func, functionData) => ({
            message: `Invalid ${func} usage: Missing brackets`,
            solution: `Make sure to add brackets to the function. Example: ${functionData.withParams}`
        }),
        missingRequiredArgument: (func, field) => ({
            message: `Missing required argument "${field}" on function ${func}!`,
            solution: 'Make sure to add all required argument to the function.'
        }),
        invalidArgumentType: (func, type, parsed) => ({
            message: `Invalid argument type for ${func}, Expected "${type.toLowerCase()}", got "${typeof parsed}"`,
            solution: 'Ensure the argument type is correct and matches the expected type.'
        }),
        constantVariable: (varname) => ({
            message: `Cannot redefine to "${varname}" because it is a constant variable`,
            solution: 'Make sure to not redefine a constant variable.'
        }),
        variableNotFound: (varname) => ({
            message: `Variable with the name "${varname}" does not exist!`,
            solution: 'Make sure to define the variable before using it.'
        }),
        invalidGuildId: (guildId) => ({
            message: `Invalid guild id provided: ${guildId}`,
            solution: 'Ensure the guild id is correct and the bot is in the guild.'
        }),
        invalidUserId: (userId) => ({
            message: `Invalid user id provided: ${userId}`,
            solution: 'Ensure the user id is correct and the user is in the guild.'
        }),
        invalidChannelId: (channelId) => ({
            message: `Invalid channel id provided: ${channelId}`,
            solution: 'Ensure the channel id is correct and the channel exists.'
        }),
        invalidMessageId: (messageId) => ({
            message: `Invalid message id provided: ${messageId}`,
            solution: 'Ensure the message id is correct and the message exists.'
        }),
        invalidRoleId: (roleId) => ({
            message: `Invalid role id provided: ${roleId}`,
            solution: 'Ensure the role id is correct and the role exists.'
        }),
        invalidEmojiId: (emojiId) => ({
            message: `Invalid emoji id provided: ${emojiId}`,
            solution: 'Ensure the emoji id is correct and the emoji exists.'
        }),
        channelNotFound: (channelId) => ({
            message: `Channel with ID: ${channelId} not found!`,
            solution: 'Ensure the channel id is correct and the channel exists.'
        }),
        objectNotFound: (name) => ({
            message: `Object with name "${name}" does not exist`,
            solution: 'Ensure the object name is correct and the object exists.'
        }),
        cacheNotFound: (name) => ({
            message: `Cache with name "${name}" does not exist`,
            solution: 'Ensure the cache name is correct and the cache exists.'
        }),
        invalidButtonStyle: (style) => ({
            message: `Invalid button style provided: ${style}`,
            solution: 'Ensure the button style one of the following: Primary, Secondary, Success, Danger, Link, Premium'
        }),
        outsideIfStatement: {
            message: 'This function is not meant to be used outside of an $if statement',
            solution: 'Ensure that this function is used inside an $if statement'
        },
        missingEndif: {
            message: 'Invalid $if usage. Malformed or missing $endif',
            solution: 'Ensure that every $if has a corresponding $endif'
        }
    };
    static ActivityType = {
        playing: discord_js_1.ActivityType.Playing,
        streaming: discord_js_1.ActivityType.Streaming,
        listening: discord_js_1.ActivityType.Listening,
        watching: discord_js_1.ActivityType.Watching,
        competing: discord_js_1.ActivityType.Competing,
        custom: discord_js_1.ActivityType.Custom,
        [discord_js_1.ActivityType.Playing]: 'playing',
        [discord_js_1.ActivityType.Streaming]: 'streaming',
        [discord_js_1.ActivityType.Listening]: 'listening',
        [discord_js_1.ActivityType.Watching]: 'watching',
        [discord_js_1.ActivityType.Competing]: 'competing',
        [discord_js_1.ActivityType.Custom]: 'custom'
    };
    static InteractionType = {
        [discord_js_1.InteractionType.Ping]: 'ping',
        [discord_js_1.InteractionType.ApplicationCommand]: 'slash',
        [discord_js_1.InteractionType.MessageComponent]: 'component',
        [discord_js_1.InteractionType.ApplicationCommandAutocomplete]: 'autocomplete',
        [discord_js_1.InteractionType.ModalSubmit]: 'modal'
    };
    static ComponentType = {
        [discord_js_1.ComponentType.ActionRow]: 'actionRow',
        [discord_js_1.ComponentType.Button]: 'button',
        [discord_js_1.ComponentType.StringSelect]: 'selectMenu',
        [discord_js_1.ComponentType.ChannelSelect]: 'selectMenu',
        [discord_js_1.ComponentType.RoleSelect]: 'selectMenu',
        [discord_js_1.ComponentType.UserSelect]: 'selectMenu',
        [discord_js_1.ComponentType.MentionableSelect]: 'selectMenu',
        [discord_js_1.ComponentType.TextInput]: 'modal'
    };
    static SlashType = {
        slash: discord_js_1.ApplicationCommandType.ChatInput,
        user: discord_js_1.ApplicationCommandType.User,
        message: discord_js_1.ApplicationCommandType.Message
    };
    static ContextType = {
        botdm: discord_js_1.InteractionContextType.BotDM,
        dm: discord_js_1.InteractionContextType.PrivateChannel,
        guild: discord_js_1.InteractionContextType.Guild
    };
    static IntegrationType = {
        guild: discord_js_1.ApplicationIntegrationType.GuildInstall,
        user: discord_js_1.ApplicationIntegrationType.UserInstall
    };
    static ChannelType = {
        text: discord_js_1.ChannelType.GuildText,
        voice: discord_js_1.ChannelType.GuildVoice,
        category: discord_js_1.ChannelType.GuildCategory,
        newsthread: discord_js_1.ChannelType.AnnouncementThread,
        publicthread: discord_js_1.ChannelType.PublicThread,
        privatethread: discord_js_1.ChannelType.PrivateThread,
        stage: discord_js_1.ChannelType.GuildStageVoice,
        forum: discord_js_1.ChannelType.GuildForum,
        directory: discord_js_1.ChannelType.GuildDirectory,
        guild: discord_js_1.ChannelType.GuildText,
        thread: discord_js_1.ChannelType.PublicThread,
        announcement: discord_js_1.ChannelType.GuildAnnouncement,
        dm: discord_js_1.ChannelType.DM,
        group: discord_js_1.ChannelType.GroupDM,
        media: discord_js_1.ChannelType.GuildMedia,
        [discord_js_1.ChannelType.GuildText]: 'text',
        [discord_js_1.ChannelType.GuildVoice]: 'voice',
        [discord_js_1.ChannelType.GuildCategory]: 'category',
        [discord_js_1.ChannelType.GuildAnnouncement]: 'announcement',
        [discord_js_1.ChannelType.AnnouncementThread]: 'newsthread',
        [discord_js_1.ChannelType.PublicThread]: 'publicthread',
        [discord_js_1.ChannelType.PrivateThread]: 'privatethread',
        [discord_js_1.ChannelType.GuildStageVoice]: 'stage',
        [discord_js_1.ChannelType.GuildForum]: 'forum',
        [discord_js_1.ChannelType.GuildDirectory]: 'directory',
        [discord_js_1.ChannelType.DM]: 'dm',
        [discord_js_1.ChannelType.GroupDM]: 'group',
        [discord_js_1.ChannelType.GuildMedia]: 'media'
    };
    static Flags = {
        crossposted: discord_js_1.MessageFlags.Crossposted,
        ephemeral: discord_js_1.MessageFlags.Ephemeral,
        failedtomentionsomerolesinthread: discord_js_1.MessageFlags.FailedToMentionSomeRolesInThread,
        hassnapshot: discord_js_1.MessageFlags.HasSnapshot,
        hasthread: discord_js_1.MessageFlags.HasThread,
        iscomponentsv2: discord_js_1.MessageFlags.IsComponentsV2,
        isvoicemessage: discord_js_1.MessageFlags.IsVoiceMessage,
        iscrosspost: discord_js_1.MessageFlags.IsCrosspost,
        loading: discord_js_1.MessageFlags.Loading,
        shouldshowlinknotdiscordwarning: discord_js_1.MessageFlags.ShouldShowLinkNotDiscordWarning,
        sourcemessagedeleted: discord_js_1.MessageFlags.SourceMessageDeleted,
        suppressembeds: discord_js_1.MessageFlags.SuppressEmbeds,
        suppressnotifications: discord_js_1.MessageFlags.SuppressNotifications,
        urgent: discord_js_1.MessageFlags.Urgent,
        [discord_js_1.MessageFlags.Crossposted]: 'crossposted',
        [discord_js_1.MessageFlags.Ephemeral]: 'ephemeral',
        [discord_js_1.MessageFlags.FailedToMentionSomeRolesInThread]: 'failedtomentionsomerolesinthread',
        [discord_js_1.MessageFlags.HasSnapshot]: 'hassnapshot',
        [discord_js_1.MessageFlags.HasThread]: 'hasthread',
        [discord_js_1.MessageFlags.IsComponentsV2]: 'iscomponentsv2',
        [discord_js_1.MessageFlags.IsVoiceMessage]: 'isvoicemessage',
        [discord_js_1.MessageFlags.IsCrosspost]: 'iscrosspost',
        [discord_js_1.MessageFlags.Loading]: 'loading',
        [discord_js_1.MessageFlags.ShouldShowLinkNotDiscordWarning]: 'shouldshowlinknotdiscordwarning',
        [discord_js_1.MessageFlags.SourceMessageDeleted]: 'sourcemessagedeleted',
        [discord_js_1.MessageFlags.SuppressEmbeds]: 'suppressembeds',
        [discord_js_1.MessageFlags.SuppressNotifications]: 'suppressnotifications',
        [discord_js_1.MessageFlags.Urgent]: 'urgent'
    };
    static Caches = {
        messages: 'MessageManager',
        users: 'UserManager',
        applicationCommands: 'ApplicationCommandManager',
        presences: 'PresenceManager',
        reactions: 'ReactionManager',
        reactionUsers: 'ReactionUserManager',
        stageInstances: 'StageInstanceManager',
        threads: 'ThreadManager',
        threadMembers: 'ThreadMemberManager',
        voiceStates: 'VoiceStateManager',
        guildBans: 'GuildBanManager',
        guildEmojis: 'GuildEmojiManager',
        guildInvites: 'GuildInviteManager',
        guildMembers: 'GuildMemberManager',
        guildStickers: 'GuildStickerManager',
        guildScheduledEvents: 'GuildScheduledEventManager',
        applicationEmojis: 'ApplicationEmojiManager',
        autoModerationRules: 'AutoModerationRuleManager',
        entitlements: 'EntitlementManager',
        dmMessages: 'DMMessageManager',
        baseGuildEmojis: 'BaseGuildEmojiManager',
        guildForumThreads: 'GuildForumThreadManager',
        guildTextThreads: 'GuildTextThreadManager',
        guildMessages: 'GuildMessageManager'
    };
}
exports.Constants = Constants;
