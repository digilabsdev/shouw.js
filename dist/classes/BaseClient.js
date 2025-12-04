"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClient = void 0;
const discord_js_1 = require("discord.js");
const index_js_1 = require("../index.js");
const Collective_js_1 = require("../utils/Collective.js");
class BaseClient extends discord_js_1.Client {
    #statuses;
    constructor({ token, intents, partials, ...options }) {
        if (Array.isArray(intents))
            intents = intents.map((i) => discord_js_1.GatewayIntentBits[i] | i);
        if (Array.isArray(partials))
            partials = partials.map((p) => discord_js_1.Partials[p] | p);
        if (!token || typeof token !== 'string')
            throw new Error('Invalid bot token! Please provide a valid discord bot token!');
        if (!options.allowedMentions)
            options.allowedMentions = {
                parse: ['users', 'roles', 'everyone'],
                repliedUser: true
            };
        if (typeof options.cache === 'object' && !Array.isArray(options.cache)) {
            options.makeCache = index_js_1.CacheManager.__discordJSCacheOptions(options.cache);
        }
        super({ intents: intents ?? [], partials: partials ?? [], ...options });
        super.login(token);
        this.#statuses = new Collective_js_1.Collective();
    }
    get statuses() {
        return this.#statuses;
    }
    status(...datas) {
        for (const data of datas) {
            if (!data || (!data.text && !data.name))
                continue;
            const timeMs = !Number.isNaN(Number(data.time)) ? Math.floor(Number(data.time) * 1000) : 20000;
            const rawType = data.type;
            const type = typeof rawType === 'string'
                ? (index_js_1.Constants.ActivityType[rawType.toLowerCase()] ?? discord_js_1.ActivityType.Playing)
                : typeof rawType === 'number' && Object.values(index_js_1.Constants.ActivityType).includes(rawType)
                    ? rawType
                    : discord_js_1.ActivityType.Playing;
            this.#statuses.set(this.#statuses.size, {
                afk: (data.afk ?? data.status === 'idle') || false,
                status: data.status ?? 'online',
                shardId: data.shardId ?? this.shard?.ids ?? void 0,
                time: timeMs,
                activities: [
                    {
                        name: data.name ?? data.text,
                        type,
                        url: data.url ?? undefined
                    }
                ]
            });
        }
        return this;
    }
}
exports.BaseClient = BaseClient;
