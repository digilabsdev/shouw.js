import { Events as DiscordEvents } from 'discord.js';
import { cyan } from 'chalk';
import {
    type Objects,
    type Interpreter,
    type Context,
    type TemporarilyData,
    type ShouwClient,
    Collective,
    Util
} from '../index.js';

export interface CommandData extends Objects {
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

export type CommandsEventMap = {
    [K in keyof typeof EventsMap]?: Collective<number, CommandData>;
};

const EventsMap: Record<string, string> = {};
for (const event of Object.values(DiscordEvents) as string[]) {
    EventsMap[event] = event;
}

/**
 * The commands manager instance to manage client commands and events
 *
 * @class CommandsManager
 * @param {ShouwClient} client - The client instance
 * @param {string[]} events - The events to load
 */
export class CommandsManager implements CommandsEventMap {
    /**
     * The client instance
     */
    public readonly client: ShouwClient;

    /**
     * The events to load
     */
    public events?: string[];

    /**
     * The events types
     */
    public static types: string[] = [...Object.values(DiscordEvents)];

    /**
     * The commands event map
     */
    [key: string | number | symbol | `${any}`]: CommandsEventMap | any;

    /**
     * The interaction create event object maps
     */
    public interactionCreate?: {
        slash: Collective<number, CommandData>;
        button: Collective<number, CommandData>;
        selectMenu: Collective<number, CommandData>;
        modal: Collective<number, CommandData>;
    };

    constructor(client: ShouwClient, events: string[] = []) {
        this.client = client;
        this.loadEvents(events);
    }

    /**
     * Check if the event is a valid type
     *
     * @param {string} event - The event to check
     * @return {boolean} - Whether the event is a valid type
     */
    public isValidEventType(event: string): boolean {
        return CommandsManager.types.includes(event);
    }

    /**
     * Load events from the events directory
     *
     * @param {string[]} events - The events to load
     * @return {void} - Nothing
     * @private
     */
    private loadEvents(events: string[]): undefined {
        if (!Array.isArray(events)) return;
        (this.events = events.filter((e: string) => Object.values(DiscordEvents).includes(e as DiscordEvents))).push(
            'clientReady'
        );

        for (const event of this.events) {
            const eventPath = `${Util.getEventPath(event)}.js`;
            if (!eventPath.endsWith('.js')) continue;

            try {
                let EventModule = require(eventPath);
                EventModule = EventModule ? (EventModule?.default ?? EventModule) : void 0;

                if (!EventModule) {
                    this.client.debug(`Event ${event} has no default export`, 'WARN');
                    continue;
                }

                if (event === 'interactionCreate') {
                    this.interactionCreate = {
                        slash: new Collective(),
                        button: new Collective(),
                        selectMenu: new Collective(),
                        modal: new Collective()
                    };
                } else {
                    this[event] = new Collective();
                }

                this.client.on(event, async (...args: any[]) => {
                    try {
                        await EventModule(...args, this.client);
                    } catch (err: any) {
                        this.client.debug(`Error in event ${event}:\n${err.stack}`, 'ERROR');
                    }
                });

                this.client.debug(`Event loaded: ${cyan(event)}`);
            } catch (err: any) {
                this.client.debug(`Error in event ${event}:\n${err.stack}`, 'ERROR');
            }
        }
    }
}
