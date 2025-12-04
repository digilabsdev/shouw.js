import { type CommandData, type Interaction, type ShouwClient, Interpreter } from '../../index.js';
import type { GuildMember } from 'discord.js';

/**
 * Interaction Create Event
 *
 * @param {Interaction} interaction
 * @param {ShouwClient} client
 * @return {Promise<void>}
 */
export default async function Events(interaction: Interaction, client: any): Promise<void> {
    if (interaction.isMessageComponent()) {
        let commands: CommandData[] = [];

        /**
         * Button interaction commands
         * @type {CommandData[]}
         */
        if (interaction.isButton()) {
            commands = client.commands.interactionCreate.button.filter((cmd: CommandData) =>
                cmd.name
                    ? Array.isArray(cmd.name)
                        ? cmd.name?.includes(interaction.customId)
                        : cmd.name === interaction.customId
                    : !cmd.name
            );
        } else if (interaction.isAnySelectMenu()) {
            /**
             * Select Menu interaction commands
             * @type {CommandData[]}
             */
            commands = client.commands.interactionCreate.selectMenu.filter((cmd: CommandData) =>
                cmd.name
                    ? Array.isArray(cmd.name)
                        ? cmd.name?.includes(interaction.customId)
                        : cmd.name === interaction.customId
                    : !cmd.name
            );
        }

        if (!commands?.length) return;
        for (const command of commands) {
            if (command.name?.includes('$') && command.name !== '$') {
                command.name = Array.isArray(command.name)
                    ? await Promise.all(
                          command.name.map(async (str: string) => {
                              if (!str.includes('$') && str !== '$') return str;
                              return await INIT({ code: str }, interaction, [interaction.customId], client);
                          })
                      )
                    : await INIT({ code: command.name }, interaction, [interaction.customId], client);
            }

            await INIT(command, interaction, [interaction.customId], client);
        }
    } else if (interaction.isModalSubmit()) {
        /**
         * Modal Submit interaction commands
         * @type {CommandData[]}
         */
        const commands: CommandData[] = client.commands.interactionCreate.modal.filter((cmd: CommandData) =>
            cmd.name
                ? Array.isArray(cmd.name)
                    ? cmd.name?.includes(interaction.customId)
                    : cmd.name === interaction.customId
                : !cmd.name
        );

        if (!commands?.length) return;
        for (const command of commands) {
            if (command.name?.includes('$') && command.name !== '$') {
                command.name = Array.isArray(command.name)
                    ? await Promise.all(
                          command.name.map(async (str: string) => {
                              if (!str.includes('$') && str !== '$') return str;
                              return await INIT({ code: str }, interaction, [interaction.customId], client);
                          })
                      )
                    : await INIT({ code: command.name }, interaction, [interaction.customId], client);
            }

            await INIT(command, interaction, [], client);
        }
    } else {
        /**
         * Slash Command interaction commands
         * @type {CommandData[]}
         */
        const commands: CommandData[] = client.commands.interactionCreate.slash.filter(
            (cmd: CommandData) => cmd.name === interaction.commandName
        );

        if (!commands?.length) return;
        for (const command of commands) {
            if (
                // @ts-expect-error
                (!!command.subCommand && interaction.options._subcommand !== command.subCommand) ||
                // @ts-expect-error
                (!!command.subCommandGroup && interaction.options._group !== command.subCommandGroup)
            )
                continue;
            // @ts-expect-error
            const args = interaction.options?._hoistedOptions?.map((option: any) => option.value);
            if (command.name?.includes('$') && command.name !== '$') {
                command.name = await INIT({ code: command.name as string }, interaction, args, client);
            }

            await INIT(command, interaction, args, client);
        }
    }
}

/**
 * Initialize the command
 *
 * @param {CommandData} command
 * @param {Interaction} interaction
 * @param {any[]} args
 * @param {ShouwClient} client
 * @return {Promise<string | undefined>}
 */
async function INIT(command: CommandData, interaction: Interaction, args: any[], client: ShouwClient): Promise<string> {
    return (
        (
            await Interpreter.run(command, {
                client: client,
                interaction: interaction,
                channel: interaction.channel ?? void 0,
                guild: interaction.guild ?? void 0,
                args: args.filter(Boolean),
                user: interaction.user,
                member: (interaction.member as GuildMember) ?? void 0
            })
        )?.result ?? ''
    );
}
