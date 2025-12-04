"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomEvent = void 0;
const node_events_1 = __importDefault(require("node:events"));
const index_js_1 = require("../index.js");
const Collective_js_1 = require("../utils/Collective.js");
class CustomEvent {
    client;
    #listenedEvents;
    #events;
    constructor(client) {
        this.client = client;
        this.#listenedEvents = new Collective_js_1.Collective();
        this.#events = new node_events_1.default();
    }
    get listenedEvents() {
        return this.#listenedEvents;
    }
    get events() {
        return this.#events;
    }
    on(...datas) {
        for (const data of datas) {
            if (typeof data !== 'object' || !data || !data.code || !data.listen)
                continue;
            this.listenedEvents.set(data.listen, data);
            this.#listen(data.listen, 'on');
        }
        return this;
    }
    once(...datas) {
        for (const data of datas) {
            if (typeof data !== 'object' || !data || !data.code || !data.listen)
                continue;
            this.listenedEvents.set(data.listen, data);
            this.#listen(data.listen, 'once');
        }
        return this;
    }
    emit(name, ...args) {
        return this.events.emit(name, ...args);
    }
    #listen(name, type = 'on') {
        if (!this.listenedEvents.has(name))
            return this;
        this.events[type](name, async (...args) => {
            await Executer(name, this.client, ...args);
        });
        return this;
    }
}
exports.CustomEvent = CustomEvent;
async function Executer(name, client, ...eventData) {
    const data = client.customEvents.listenedEvents.get(name);
    if (!data)
        return;
    const commands = client.customEvents.listenedEvents.filter((v) => v.listen === name);
    if (!commands.length)
        return;
    for (const command of commands) {
        let channel = null;
        let guild = null;
        if (command.channel?.includes('$')) {
            const parsed = await INIT({ client, command, eventData });
            if (parsed) {
                channel = client.channels.cache.get(parsed) ?? (await client.channels.fetch(parsed));
                guild = channel ? channel?.guild : null;
            }
        }
        else {
            channel =
                client.channels.cache.get(command.channel) ??
                    (await client.channels.fetch(command.channel));
            guild = channel ? channel?.guild : null;
        }
        await INIT({
            client,
            command,
            channel: channel ?? void 0,
            guild: guild ?? void 0,
            eventData
        });
    }
}
async function INIT({ client, command, channel, guild, eventData }) {
    return ((await index_js_1.Interpreter.run(command, {
        client,
        channel,
        guild,
        Temporarily: {
            eventData
        }
    }))?.result ?? '');
}
