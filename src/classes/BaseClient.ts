import { Client, GatewayIntentBits as Intents, Partials, ActivityType, type PresenceStatusData } from 'discord.js';
import { Constants, CacheManager, type ShouwClientOptions } from '../index.js';
import { Collective } from '../utils/Collective.js';

export interface Objects {
    [key: string | symbol | number | `${any}`]: unknown;
}

export interface ClientStatus {
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

/**
 * The base client class for the Shouw.js library. This class extends the discord.js Client class and adds some additional functionality.
 *
 * @class BaseClient
 * @extends {import('discord.js').Client} - The discord.js Client class
 * @param {ShouwClientOptions} options - The options for the client
 */
export class BaseClient extends Client<true> {
    /**
     * The statuses of the client
     */
    readonly #statuses: Collective<number, PresenceData>;

    constructor({ token, intents, partials, ...options }: ShouwClientOptions) {
        if (Array.isArray(intents))
            intents = intents.map((i: string | unknown) => Intents[i as string] | (i as Intents));
        if (Array.isArray(partials))
            partials = partials.map((p: string | unknown) => Partials[p as string] | (p as Partials));
        if (!token || typeof token !== 'string')
            throw new Error('Invalid bot token! Please provide a valid discord bot token!');
        if (!options.allowedMentions)
            options.allowedMentions = {
                parse: ['users', 'roles', 'everyone'],
                repliedUser: true
            };
        if (typeof options.cache === 'object' && !Array.isArray(options.cache)) {
            options.makeCache = CacheManager.__discordJSCacheOptions(options.cache);
        }

        super({ intents: intents ?? [], partials: partials ?? [], ...options });
        super.login(token);
        this.#statuses = new Collective();
    }

    /**
     * Gets the statuses of the client
     *
     * @returns {Collective<number, PresenceData>} - The statuses of the client
     */
    public get statuses(): Collective<number, PresenceData> {
        return this.#statuses;
    }

    /**
     * Sets the status of the client
     *
     * @param {ClientStatus[]} datas - The statuses to set
     * @returns {BaseClient} - The client instance
     */
    public status(...datas: ClientStatus[]): BaseClient {
        for (const data of datas) {
            if (!data || (!data.text && !data.name)) continue;
            const timeMs = !Number.isNaN(Number(data.time)) ? Math.floor(Number(data.time) * 1000) : 20000;

            const rawType = data.type;
            const type =
                typeof rawType === 'string'
                    ? (Constants.ActivityType[rawType.toLowerCase()] ?? ActivityType.Playing)
                    : typeof rawType === 'number' && Object.values(Constants.ActivityType).includes(rawType)
                      ? rawType
                      : ActivityType.Playing;

            this.#statuses.set(this.#statuses.size, {
                afk: (data.afk ?? data.status === 'idle') || false,
                status: data.status ?? 'online',
                shardId: data.shardId ?? this.shard?.ids ?? void 0,
                time: timeMs,
                activities: [
                    {
                        name: data.name ?? (data.text as string),
                        type,
                        url: data.url ?? undefined
                    }
                ]
            });
        }

        return this;
    }
}
