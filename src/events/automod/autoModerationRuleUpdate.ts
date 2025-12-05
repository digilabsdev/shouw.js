import { Interpreter, type ShouwClient } from '../../index.js';
import type { Channel, Guild, Snowflake, AutoModerationRule } from 'discord.js';

export default async function Events(
    oldRule: AutoModerationRule,
    newRule: AutoModerationRule,
    client: ShouwClient
): Promise<void> {
    const commands = client.commands?.autoModerationRuleUpdate?.V;
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
                            Temporarily: { newRule, oldRule } as any,
                            user: client.users.cache.get(newRule.creatorId as Snowflake)
                        },
                        { sendMessage: false }
                    )
                )?.result ?? ''
            );
            guild = (channel as any)?.guild;
        }

        await Interpreter.run(command, {
            client: client,
            Temporarily: { oldRule, newRule } as any,
            guild,
            channel,
            user: client.users.cache.get(newRule.creatorId as Snowflake),
            member: guild?.members.cache.get(newRule.creatorId as Snowflake)
        });
    }
}
