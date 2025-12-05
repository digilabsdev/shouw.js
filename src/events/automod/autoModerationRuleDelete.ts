import { Interpreter, type ShouwClient } from '../../index.js';
import type { Channel, Guild, Snowflake, AutoModerationRule } from 'discord.js';

export default async function Events(rule: AutoModerationRule, client: ShouwClient): Promise<void> {
    const commands = client.commands?.autoModerationRuleDelete?.V;
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
                            Temporarily: { rule } as any,
                            user: client.users.cache.get(rule.creatorId as Snowflake)
                        },
                        { sendMessage: false }
                    )
                )?.result ?? ''
            );
            guild = (channel as any)?.guild;
        }

        await Interpreter.run(command, {
            client: client,
            Temporarily: { rule } as any,
            guild,
            channel,
            user: client.users.cache.get(rule.creatorId as Snowflake),
            member: guild?.members.cache.get(rule.creatorId as Snowflake)
        });
    }
}
