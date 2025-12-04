import { type ShouwClient, Interpreter, ConsoleDisplay, Constants } from '../../index.js';
import type { Channel, Guild } from 'discord.js';
import Status from '../helper/clientStatus.js';

/**
 * Ready Event
 *
 * @param {ShouwClient} client
 * @return {Promise<void>}
 */
export default async function Events(client: ShouwClient): Promise<void> {
    Status(client);
    if (client.shouwOptions.shouwLogs) {
        ConsoleDisplay.displayConsole('Shouw.js', 'white', [
            { text: `Logged in as ${client.user?.tag}`, color: 'green' },
            { text: `Installed on version v${Constants.Version}`, color: 'cyan' }
        ]);
    }

    const commands = client.commands?.ready?.V;
    if (!commands) return;

    for (const command of commands) {
        if (!command || !command.code) break;
        let channel: Channel | undefined;
        let guild: Guild | undefined;

        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get(
                (await Interpreter.run({ code: command.channel }, { client }, { sendMessage: false }))?.result ?? ''
            );
            guild = (channel as any)?.guild;
        }

        await Interpreter.run(command, {
            client,
            guild,
            channel
        });
    }
}
