import * as Discord from 'discord.js';
import { Client, PresenceStatusData, ActivityType, ClientOptions, ClientEvents, CacheFactory, ShardingManager as ShardingManager$1, MultipleShardSpawnOptions, Collection, Shard, Channel, CategoryChannel, PartialGroupDMChannel, PartialDMChannel, ForumChannel, MediaChannel, User, GuildMember, Guild, Message, ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction, ContextMenuCommandInteraction, MessagePayload, MessageReplyOptions, MessageCreateOptions, OmitPartialGroupDMChannel, InteractionReplyOptions, InteractionCallbackResponse, InteractionEditReplyOptions, InteractionResponse, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ChannelType, MessageFlags, Caches, Role, Emoji } from 'discord.js';
import EventEmitter from 'node:events';
import chalk from 'chalk';

declare class Collective<K, V> extends Map<K, V> {
    create(key: K, value: V): Collective<K, V>;
    filter(fn: (value: V, index: number, array: V[]) => boolean): V[];
    filterKeys(fn: (value: K, index: number, array: K[]) => boolean): K[];
    find(fn: (value: V, index: number, array: V[]) => boolean): V | undefined;
    findKey(fn: (value: K, index: number, array: K[]) => boolean): K | undefined;
    some(fn: (value: V, index: number, array: V[]) => boolean): boolean;
    someKeys(fn: (value: K, index: number, array: K[]) => boolean): boolean;
    every(fn: (value: V, index: number, array: V[]) => boolean): boolean;
    everyKeys(fn: (value: K, index: number, array: K[]) => boolean): boolean;
    has(key: K): boolean;
    get K(): Array<K>;
    get V(): Array<V>;
}

interface Objects {
    [key: string | symbol | number | `${any}`]: unknown;
}
interface ClientStatus {
    text?: string;
    name?: string;
    status?: 'online' | 'dnd' | 'idle' | 'invisible';
    type: 'playing' | 'streaming' | 'listening' | 'watching' | 'competing' | 'custom' | keyof ActivityType;
    url?: string;
    afk?: boolean;
    shardId?: number | number[];
    time?: number;
}
interface PresenceData {
    time?: number;
    afk: boolean;
    status: PresenceStatusData;
    shardId?: number | number[];
    activities: {
        name: string;
        type: ActivityType;
        url?: string;
    }[];
}
declare class BaseClient extends Client<true> {
    #private;
    constructor({ token, intents, partials, ...options }: ShouwClientOptions);
    get statuses(): Collective<number, PresenceData>;
    status(...datas: ClientStatus[]): BaseClient;
}

interface ShouwClientOptions extends ClientOptions {
    token: undefined | string;
    events: Array<keyof ClientEvents>;
    prefix: string | string[];
    debug?: boolean;
    extensions?: any[];
    suppressAllErrors?: boolean;
    shouwLogs?: boolean;
    cache?: CacheOptions;
    disableFunctions?: string[];
    respondToBots?: boolean;
    guildOnly?: boolean;
    [key: string | number | symbol | `${any}`]: any;
}
interface CacheOptions {
    [key: string]: number | {
        keepOverLimit?: (value: any, key: any, collection: any) => boolean | Promise<boolean>;
        maxSize?: number;
    };
}
declare class ShouwClient extends BaseClient {
    functions: FunctionsManager;
    commands: CommandsManager;
    database?: any;
    music?: any;
    readonly variablesManager: Variables;
    readonly cacheManager: CacheManager;
    readonly customEvents: CustomEvent;
    readonly prefix: Array<string>;
    readonly shouwOptions: ShouwClientOptions;
    constructor(options: ShouwClientOptions);
    command(...datas: CommandData[]): ShouwClient;
    loadCommands(dir: string, logging?: boolean): ShouwClient;
    variables(variables: Record<string, any>, table?: string): ShouwClient;
    private _loadExtensions;
    private _disableFunctions;
    debug(message: string, type?: 'ERROR' | 'DEBUG' | 'WARN', force?: boolean): ShouwClient;
}

interface CommandData extends Objects {
    name?: string | string[];
    aliases?: string | string[];
    channel?: string;
    code: string | ((int: Interpreter, ctx: Context, data: TemporarilyData) => any);
    type?: string;
    prototype?: 'slash' | 'button' | 'selectMenu' | 'modal';
    subCommand?: string;
    subCommandGroup?: string;
    [key: string | number | symbol | `${any}`]: any;
}
type CommandsEventMap = {
    [K in keyof typeof EventsMap]?: Collective<number, CommandData>;
};
declare const EventsMap: Record<string, string>;
declare class CommandsManager implements CommandsEventMap {
    readonly client: ShouwClient;
    events?: string[];
    static types: string[];
    [key: string | number | symbol | `${any}`]: CommandsEventMap | any;
    interactionCreate?: {
        slash: Collective<number, CommandData>;
        button: Collective<number, CommandData>;
        selectMenu: Collective<number, CommandData>;
        modal: Collective<number, CommandData>;
    };
    constructor(client: ShouwClient, events?: string[]);
    isValidEventType(event: string): boolean;
    private loadEvents;
}

interface FunctionData extends Objects {
    name: string;
    description?: string;
    brackets?: boolean;
    escapeArguments?: boolean;
    example?: string;
    params?: {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    }[];
    code?: (int: Interpreter, args: any[], data: TemporarilyData) => FunctionResultData | Promise<FunctionResultData>;
}
interface CustomFunctionData {
    code: string | ((int: Interpreter, args: any[], data: TemporarilyData) => FunctionResultData | Promise<FunctionResultData>);
    type: 'shouw.js' | 'discord.js' | 'djs';
    escapeArguments?: boolean;
    description?: string;
    example?: string;
    brackets?: boolean;
    params?: FunctionData['params'];
    name: string;
}
declare class FunctionsManager extends Collective<string, Functions | CustomFunction> {
    readonly client: ShouwClient;
    constructor(client: ShouwClient);
    load(basePath: string, debug: boolean): Promise<undefined>;
    createFunction(...datas: CustomFunctionData[]): FunctionsManager;
}

declare class Variables {
    #private;
    readonly client: ShouwClient;
    readonly database: any;
    readonly tables: string[];
    constructor(client: ShouwClient);
    get cache(): Collective<string, {
        name: string;
        value: any;
        table: string;
    }>;
    set(name: string, value: any, table?: string): Variables;
    get(name: string, table?: string): {
        name: string;
        value: any;
        table: string;
    } | undefined;
    delete(name: string, table?: string): Variables;
    clear(): Variables;
    has(name: string, table?: string): boolean;
    get size(): number;
    get keys(): string[];
    get values(): {
        name: string;
        value: any;
        table: string;
    }[];
}

declare class CacheManager {
    #private;
    readonly client: ShouwClient;
    constructor(client: ShouwClient);
    get cache(): {
        [name: string]: Collective<any, any>;
    };
    createCache<K, V>(name: string): Collective<K, V>;
    getCache(name: string): Collective<any, any>;
    deleteCache(name: string): void;
    hasCache(name: string): boolean;
    get cacheNames(): string[];
    get caches(): Collective<any, any>[];
    get(name: string, key: any): any;
    set(name: string, key: any, value: any): Collective<any, any> | undefined;
    delete(name: string, key: any): boolean;
    clear(name: string): void;
    has(name: string, key: any): boolean;
    size(name: string): number;
    keys(name: string): any[];
    values(name: string): any[];
    static __discordJSCacheOptions(caches: {
        [K: string]: number | {
            maxSize?: number;
            keepOverLimit?: (value: any, key: any, collection: Collective<any, any>) => boolean | Promise<boolean>;
        };
    }): CacheFactory;
}

interface CustomEventData extends Objects {
    name?: string;
    listen: string;
    channel?: string;
    code: string | ((int: Interpreter, ctx: Context, data: Interpreter['Temporarily']) => any);
}
declare class CustomEvent {
    #private;
    readonly client: ShouwClient;
    constructor(client: ShouwClient);
    get listenedEvents(): Collective<string, CustomEventData>;
    get events(): EventEmitter;
    on(...datas: CustomEventData[]): CustomEvent;
    once(...datas: CustomEventData[]): CustomEvent;
    emit(name: string, ...args: any[]): boolean;
}

interface ShardingOptions {
    file: string;
    token: string;
    totalShards?: number | 'auto';
    shardList?: number[] | 'auto';
    mode?: 'process' | 'worker';
    respawn?: boolean;
    silent?: boolean;
    shardArgs?: string[];
    execArgv?: string[];
    spawnOptions?: MultipleShardSpawnOptions;
}
declare class ShardingManager extends ShardingManager$1 {
    readonly options: ShardingOptions;
    constructor(options: ShardingOptions);
    spawn(options?: MultipleShardSpawnOptions): Promise<Collection<number, Shard>>;
    onShardCreate(eventFunction: (shard: Shard, chalk: chalk.Chalk) => any | Promise<any>): ShardingManager;
}

type Flags = Discord.BitFieldResolvable<'SuppressEmbeds' | 'SuppressNotifications' | 'IsComponentsV2', Discord.MessageFlags.SuppressEmbeds | Discord.MessageFlags.SuppressNotifications | Discord.MessageFlags.IsComponentsV2> | undefined;
type SelectMenuTypes = Discord.APIStringSelectComponent | Discord.APIRoleSelectComponent | Discord.APIChannelSelectComponent | Discord.APIMentionableSelectComponent | Discord.APIUserSelectComponent;
type ComponentTypes = Discord.APIActionRowComponent<Discord.APIComponentInActionRow> | Discord.APIContainerComponent | Discord.APITextDisplayComponent | Discord.APISectionComponent | Discord.APIMediaGalleryComponent | Discord.APISeparatorComponent | undefined;
type CustomParserResult = {
    key: string;
    value: string | Array<undefined | string>;
} | {
    key: string;
    value: string | Array<undefined | string>;
}[] | undefined;
declare function Parser(ctx: Interpreter, input: string): Promise<SendData>;
declare function CustomParser(key: string, value: string, length: number, many: boolean, split?: 'normal' | 'emoji' | 'none'): CustomParserResult;

interface InterpreterOptions {
    client: ShouwClient;
    guild?: Discord.Guild;
    channel?: Discord.Channel;
    member?: Discord.GuildMember;
    user?: Discord.User;
    context?: Context;
    args?: string[];
    debug?: boolean;
    Temporarily?: TemporarilyData;
    message?: Discord.Message;
    interaction?: Interaction;
    isAutocomplete?: boolean;
    suppressErrors?: {
        suppress: boolean;
        message: SendData | undefined;
    };
}
interface TemporarilyData extends Objects {
    arrays: Objects;
    objects: Objects;
    variables: Objects;
    constants: Objects;
    splits: Array<string>;
    randoms: Objects;
    timezone: string | undefined;
}
interface HelpersData {
    parser: (ctx: Interpreter, input: string) => Promise<SendData>;
    sleep: (ms: number) => Promise<void>;
    time: typeof Time;
    condition: (input: string) => boolean;
    interpreter: typeof Interpreter;
    unescape: (str: string) => string;
    escape: (str: string) => string;
    mustEscape: (str: string) => string;
}
interface ExtraOptionsData {
    sendMessage?: boolean;
    returnId?: boolean;
    returnResult?: boolean;
    returnError?: boolean;
    returnData?: boolean;
}
interface InterpreterResult {
    id?: string;
    result?: undefined | string;
    error?: boolean;
    data?: Objects;
}
declare class Container {
    readonly client: ShouwClient;
    readonly functions: FunctionsManager;
    readonly debug: boolean | undefined;
    readonly start: number;
    readonly interpreter: typeof Interpreter;
    code: string | ((ctx: Interpreter, context: Context, data: TemporarilyData) => any);
    readonly command: CommandData;
    readonly channel?: Discord.Channel;
    useChannel?: SendableChannel;
    readonly guild?: Discord.Guild;
    readonly member?: Discord.GuildMember;
    readonly user?: Discord.User;
    readonly context: Context;
    readonly args?: string[];
    embeds: Discord.EmbedBuilder[];
    attachments: Discord.AttachmentBuilder[];
    stickers: Discord.Sticker[];
    flags: Array<number | string | bigint>;
    message: Discord.Message | undefined;
    interaction: Interaction | undefined;
    readonly noop: () => void;
    readonly helpers: HelpersData;
    readonly Temporarily: TemporarilyData;
    readonly discord: typeof Discord;
    readonly util: typeof Util;
    readonly extras: ExtraOptionsData;
    isError: boolean;
    components: any[];
    readonly suppressErrors: {
        suppress: boolean;
        message: SendData | undefined;
    };
    currentFunction: string | null;
    constructor(cmd: CommandData, options: InterpreterOptions, extras?: ExtraOptionsData);
    setObject(name: string, value: Objects): this;
    getObject(name: string): unknown;
    getObjectProperty(name: string, property: string): any;
    getObjectArrayIndex(name: string, index: number): any;
    setObjectProperty(name: string, property: string, value: any): this;
    isArray(name: string): boolean;
    hasObject(name: string): boolean;
    deleteObject(name: string): void;
    setArray(name: string, value: any[]): this;
    getArray(name: string): unknown;
    getArrayIndex(name: string, index: number): any;
    hasArray(name: string): boolean;
    deleteArray(name: string): this;
    setStickers(stickers: Discord.Sticker[]): this;
    pushSticker(sticker: Discord.Sticker): this;
    getStickers(): Discord.Sticker[];
    setError(error: boolean): this;
    getError(): boolean;
    setComponents(components: any[]): this;
    pushComponent(component: any, index?: number): this;
    getComponent(index?: number): any;
    getComponents(): any[];
    setFlags(flags: Array<number | string | bigint>): this;
    pushFlag(flag: number | string | bigint): this;
    getFlags(): (string | number | bigint)[];
    setAttachments(attachments: Discord.AttachmentBuilder[]): this;
    pushAttachment(attachment: Discord.AttachmentBuilder, index?: number): this;
    getAttachment(index?: number): Discord.AttachmentBuilder;
    getAttachments(): Discord.AttachmentBuilder[];
    setEmbeds(embeds: Discord.EmbedBuilder[]): this;
    pushEmbed(embed: Discord.EmbedBuilder, index?: number): this;
    getEmbed(index?: number): Discord.EmbedBuilder;
    getEmbeds(): Discord.EmbedBuilder[];
    setSuppress(suppress: boolean, message?: SendData): this;
    setSuppressMessage(message: SendData): this;
    setSuppressSuppress(suppress: boolean): this;
    getSuppress(): {
        suppress: boolean;
        message: SendData | undefined;
    };
    setUseChannel(channel: SendableChannel): Container;
    getUseChannel(): SendableChannel | undefined;
    getSendableChannel(): SendableChannel | Context | undefined;
    setVariable(name: string, value: any): this;
    getVariable(name: string): unknown;
    hasVariable(name: string): boolean;
    deleteVariable(name: string): this;
    setConstantVariable(name: string, value: any): this;
    getConstantVariable(name: string): unknown;
    hasConstantVariable(name: string): boolean;
    setSplits(split: any[]): this;
    getSplit(index?: number): string;
    getSplits(): string[];
    setRandom(name: string, value: any): this;
    getRandom(name: string): unknown;
    setTimezone(timezone: string): this;
    getTimezone(): string | undefined;
    createCache(name: string): Collective<unknown, unknown>;
    getCache(name: string): Collective<any, any>;
    hasCache(name: string): boolean;
    deleteCache(name: string): void;
    getCacheData(name: string, key: any): any;
    setCacheData(name: string, key: any, value: any): Collective<any, any> | undefined;
    deleteCacheData(name: string, key: any): boolean;
    clearCache(name: string): void;
    hasCacheData(name: string, key: any): boolean;
    getCacheSize(name: string): number;
    parser(ctx: Interpreter, input: string): Promise<SendData>;
    sleep(ms: number): Promise<void>;
    get time(): typeof Time;
    condition(input: string): boolean;
    unescape(str: string): string;
    escape(str: string): string;
    mustEscape(str: string): string;
    get constants(): typeof Constants;
}

declare class Interpreter extends Container {
    static run(command: CommandData, options: InterpreterOptions, extras?: ExtraOptionsData): Promise<InterpreterResult>;
    private initialize;
    private processFunction;
    private processArgs;
    private unpack;
    private extractArguments;
    private extractFunctions;
    success(result?: any, error?: boolean, ...data: FunctionResultData[]): FunctionResultData;
    error(options: string | {
        message: string;
        solution?: string;
    }, functionName?: string): Promise<FunctionResultData>;
    private switchArg;
    private buildResult;
    private shouldSendMessage;
    private replaceExecutionTime;
}

interface IFBlockResult {
    code: string;
    error: boolean;
    index: number;
    length: number;
}
declare class IF {
    private readonly code;
    private readonly ctx;
    private readonly index;
    constructor(code: string, ctx: Interpreter, index: number);
    static run(code: string, ctx: Interpreter, index: number): Promise<IFBlockResult>;
    private initialize;
    private parseBranches;
    private extractTopLevelBlock;
    private extractCondition;
}

type Interaction = ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction | ContextMenuCommandInteraction;
type InteractionEdit = string | MessagePayload | InteractionEditReplyOptions;
type InteractionWithMessage = Interaction | Message;
type SendData = string | MessagePayload | MessageReplyOptions | MessageCreateOptions;
type MessageReplyData = string | MessagePayload | MessageReplyOptions;
type InteractionReplyData = string | (InteractionReplyOptions & {
    fetchReply?: boolean;
    withResponse?: boolean;
});
type SendableChannel = Exclude<Channel, CategoryChannel | PartialGroupDMChannel | PartialDMChannel | ForumChannel | MediaChannel> | null;
declare class Context {
    args?: Array<string>;
    channel?: SendableChannel;
    user?: User | null;
    member?: GuildMember | null;
    guild?: Guild | null;
    message?: Message | null;
    interaction?: Interaction | null;
    constructor(ctx: InteractionWithMessage, args?: Array<string>);
    private get isInteraction();
    private get isReplied();
    send(data: SendData): Promise<Message<boolean> | undefined>;
    reply(data: MessageReplyData): Promise<Message<boolean> | OmitPartialGroupDMChannel<Message<boolean>> | undefined>;
    reply(data: InteractionReplyData): Promise<InteractionCallbackResponse>;
    editReply(data: InteractionEdit): Promise<Message<boolean> | undefined>;
    deleteReply(): Promise<void>;
    fetchReply(): Promise<Message<boolean> | undefined>;
    deferReply(ephemeral?: boolean): Promise<InteractionCallbackResponse | undefined>;
    followUp(data: InteractionReplyData): Promise<Message<boolean> | undefined>;
    deferUpdate(): Promise<InteractionCallbackResponse | undefined>;
    update(data: InteractionEdit): Promise<InteractionResponse<boolean> | undefined>;
}

interface FunctionResultData extends Omit<InterpreterOptions, 'client'> {
    result: string | unknown;
    error?: boolean;
    embeds?: EmbedBuilder[];
    attachments?: AttachmentBuilder[];
    components?: ActionRowBuilder[];
    flags?: number | string | bigint;
    message?: Message;
}
declare enum ParamType {
    URL = "URL",
    String = "String",
    BigInt = "BigInt",
    Void = "Void",
    Number = "Number",
    Color = "Color",
    Object = "Object",
    Array = "Array",
    Boolean = "Boolean",
    Any = "Any"
}
declare class Functions {
    #private;
    constructor(data: FunctionData);
    code(_ctx: Interpreter, _args: Array<any>, _data: TemporarilyData): Promise<FunctionResultData> | FunctionResultData;
    get name(): string;
    get brackets(): boolean | undefined;
    get description(): string | undefined;
    get example(): string | undefined;
    get escapeArguments(): boolean;
    get params(): {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    }[] | undefined;
    get paramsLength(): number;
    get withParams(): string;
    getParam(index: number): {
        name: string;
        description?: string;
        required: boolean;
        type: ParamType;
        rest?: boolean;
    };
    get isAsync(): boolean;
    success(result?: any, error?: boolean, ...data: FunctionResultData[]): FunctionResultData;
    error(...data: FunctionResultData[]): FunctionResultData;
}
declare class CustomFunction extends Functions {
    #private;
    constructor(data: CustomFunctionData);
    get codeType(): string;
    get type(): string;
    get stringCode(): string;
    get isAsync(): boolean;
    code(ctx: Interpreter, args: any[], data: TemporarilyData): Promise<FunctionResultData>;
}

declare function CheckCondition(input: string): boolean;

declare class Time {
    private static units;
    static format(_time: number, useLongName?: boolean): string;
    static parse(time: string | number): {
        ms: number;
        format: string;
    };
    static parseDigital(time: string): {
        ms: number;
        format: string;
    };
    static digital(time: number): string;
    private static pluralize;
}

declare class Reader {
    private readonly filePath;
    private fileContent;
    constructor(filePath: string);
    static run(filePath: string): CommandData[];
    private readFile;
    private removeComments;
    private parse;
    private execute;
}

declare global {
    interface String {
        unescape(): string;
        escape(): string;
        mustEscape(): string;
        toArray(): any[] | undefined;
        toObject(): object | undefined;
        toURL(): string | undefined;
        toBoolean(): boolean | undefined;
    }
}

declare function sleep(ms: number): Promise<void>;
declare function wait(ms: number): Promise<void>;
declare function filterObject<T extends object>(object: T): T | undefined;
declare function filterArray<T>(arr: T[]): T[] | undefined;

declare class Constants {
    static Version: string;
    static Errors: {
        build: (options: string | {
            message: string;
            solution?: string;
        }, functionName: string, all?: string | null) => string;
        buildLog: (options: string | {
            message: string;
            solution?: string;
        }, all?: string | null) => string;
        missingBrackets: (func: string, functionData: Functions | CustomFunction) => {
            message: string;
            solution: string;
        };
        missingRequiredArgument: (func: string, field: string) => {
            message: string;
            solution: string;
        };
        invalidArgumentType: (func: string, type: string, parsed: any) => {
            message: string;
            solution: string;
        };
        constantVariable: (varname: string) => {
            message: string;
            solution: string;
        };
        variableNotFound: (varname: string) => {
            message: string;
            solution: string;
        };
        invalidGuildId: (guildId: string) => {
            message: string;
            solution: string;
        };
        invalidUserId: (userId: string) => {
            message: string;
            solution: string;
        };
        invalidChannelId: (channelId: string) => {
            message: string;
            solution: string;
        };
        invalidMessageId: (messageId: string) => {
            message: string;
            solution: string;
        };
        invalidRoleId: (roleId: string) => {
            message: string;
            solution: string;
        };
        invalidEmojiId: (emojiId: string) => {
            message: string;
            solution: string;
        };
        channelNotFound: (channelId: string) => {
            message: string;
            solution: string;
        };
        objectNotFound: (name: string) => {
            message: string;
            solution: string;
        };
        cacheNotFound: (name: string) => {
            message: string;
            solution: string;
        };
        invalidButtonStyle: (style: string) => {
            message: string;
            solution: string;
        };
        outsideIfStatement: {
            message: string;
            solution: string;
        };
        missingEndif: {
            message: string;
            solution: string;
        };
    };
    static ActivityType: Record<string, number> | Record<number, string>;
    static InteractionType: Record<number, string>;
    static ComponentType: Record<number, string>;
    static SlashType: Record<string, number>;
    static ContextType: Record<string, number>;
    static IntegrationType: Record<string, number>;
    static ChannelType: Record<string | ChannelType, ChannelType | string>;
    static Flags: Record<string | MessageFlags, MessageFlags | string>;
    static Caches: Record<string, keyof Caches>;
}

declare class Util extends Constants {
    static getChannel(ctx: Interpreter, channelInput: string): Promise<Channel | undefined>;
    static getGuild(ctx: Interpreter, guildInput: string): Promise<Guild | undefined>;
    static getMember(ctx: Interpreter, guildInput: string, memberInput: string): Promise<GuildMember | undefined>;
    static getRole(ctx: Interpreter, guildInput: string, roleInput: string): Promise<Role | undefined>;
    static getUser(ctx: Interpreter, userInput: string): Promise<User | undefined>;
    static getMessage(ctx: Interpreter, channelInput: string, messageInput: string): Promise<Message | undefined>;
    static isUnicodeEmoji(str: string): boolean;
    static getEmoji(ctx: Interpreter, _emojiInput: string): Promise<Emoji | {
        id: string | undefined;
        name: string | null;
        animated: boolean;
    } | undefined>;
    static getEventPath(type: string): string;
}

interface ConsoleDisplayLine {
    text: string;
    color: string;
}
interface ConsoleDisplayCommand {
    name: string;
    command?: string;
    loaded: boolean;
    error?: Error;
}
declare class ConsoleDisplay {
    private readonly readyInfo;
    private readonly commandStatusTable;
    private frameColor;
    constructor();
    static displayConsole(title: string, theme: string, lines: ConsoleDisplayLine[]): undefined;
    static commandList(theme: string, commands: ConsoleDisplayCommand[]): undefined;
    private command;
    private info;
    private setTheme;
    private stripAnsi;
    private padCell;
    private getColumnWidths;
    private drawTable;
    private drawBlock;
    private printInfo;
    private printCommandStatus;
}

export { BaseClient, CacheManager, CheckCondition, type ClientStatus, Collective, type CommandData, type CommandsEventMap, CommandsManager, type ComponentTypes, ConsoleDisplay, Constants, Context, CustomEvent, type CustomEventData, CustomFunction, type CustomFunctionData, CustomParser, type ExtraOptionsData, type Flags, type FunctionData, type FunctionResultData, Functions, FunctionsManager, type HelpersData, IF, type IFBlockResult, type Interaction, type InteractionReplyData, type InteractionWithMessage, Interpreter, type InterpreterOptions, type InterpreterResult, type MessageReplyData, type Objects, ParamType, Parser, Reader, type SelectMenuTypes, type SendData, type SendableChannel, ShardingManager, type ShardingOptions, ShouwClient, type ShouwClientOptions, type TemporarilyData, Time, Util, Variables, filterArray, filterObject, sleep, wait };
