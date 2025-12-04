"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandsManager = void 0;
const discord_js_1 = require("discord.js");
const chalk_1 = require("chalk");
const index_js_1 = require("../index.js");
const EventsMap = {};
for (const event of Object.values(discord_js_1.Events)) {
    EventsMap[event] = event;
}
class CommandsManager {
    client;
    events;
    static types = [...Object.values(discord_js_1.Events)];
    interactionCreate;
    constructor(client, events = []) {
        this.client = client;
        this.loadEvents(events);
    }
    isValidEventType(event) {
        return CommandsManager.types.includes(event);
    }
    loadEvents(events) {
        if (!Array.isArray(events))
            return;
        (this.events = events.filter((e) => Object.values(discord_js_1.Events).includes(e))).push('clientReady');
        for (const event of this.events) {
            const eventPath = `${index_js_1.Util.getEventPath(event)}.js`;
            if (!eventPath.endsWith('.js'))
                continue;
            try {
                let EventModule = require(eventPath);
                EventModule = EventModule ? (EventModule?.default ?? EventModule) : void 0;
                if (!EventModule) {
                    this.client.debug(`Event ${event} has no default export`, 'WARN');
                    continue;
                }
                if (event === 'interactionCreate') {
                    this.interactionCreate = {
                        slash: new index_js_1.Collective(),
                        button: new index_js_1.Collective(),
                        selectMenu: new index_js_1.Collective(),
                        modal: new index_js_1.Collective()
                    };
                }
                else {
                    this[event] = new index_js_1.Collective();
                }
                this.client.on(event, async (...args) => {
                    try {
                        await EventModule(...args, this.client);
                    }
                    catch (err) {
                        this.client.debug(`Error in event ${event}:\n${err.stack}`, 'ERROR');
                    }
                });
                this.client.debug(`Event loaded: ${(0, chalk_1.cyan)(event)}`);
            }
            catch (err) {
                this.client.debug(`Error in event ${event}:\n${err.stack}`, 'ERROR');
            }
        }
    }
}
exports.CommandsManager = CommandsManager;
