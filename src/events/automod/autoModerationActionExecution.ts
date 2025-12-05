import { Interpreter, type ShouwClient } from '../../index.js';
import type { Channel, Guild, Snowflake, AutoModerationActionExecution } from 'discord.js';

export default async function Events(action: AutoModerationActionExecution, client: ShouwClient): Promise<void> {
    const commands = client.commands?.autoModerationActionExecution?.V;
    if (!commands || !commands.length) return;

    for (const command of commands) {
        if (!command || !command.code) break;
        let channel: Channel | undefined;
        let guild: Guild | undefined;

        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get(
                (
                    await Interpreter.run(
                        {
                            code: command.channel
                        },
                        {
                            client,
                            Temporarily: { action } as any,
                            user: action.user ?? void 0,
                            member: action.member ?? void 0,
                            guild: action.guild,
                            channel: action.channel as any,
                            message: (action.channel as any)?.messages?.cache.get(action.messageId as Snowflake),
                            args: (action.content as string)?.trim()?.split(/ +/)
                        },
                        { sendMessage: false }
                    )
                )?.result ?? ''
            );
            guild = (channel as any)?.guild;
        }

        await Interpreter.run(command, {
            client,
            Temporarily: { action } as any,
            user: action.user ?? void 0,
            member: action.member ?? void 0,
            guild: action.guild,
            channel: action.channel as any,
            message: (action.channel as any)?.messages?.cache.get(action.messageId as Snowflake),
            args: (action.content as string)?.trim()?.split(/ +/)
        });
    }
}
