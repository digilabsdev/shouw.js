"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
async function Events(interaction, client) {
    if (interaction.isMessageComponent()) {
        let commands = [];
        if (interaction.isButton()) {
            commands = client.commands.interactionCreate.button.filter((cmd) => cmd.name
                ? Array.isArray(cmd.name)
                    ? cmd.name?.includes(interaction.customId)
                    : cmd.name === interaction.customId
                : !cmd.name);
        }
        else if (interaction.isAnySelectMenu()) {
            commands = client.commands.interactionCreate.selectMenu.filter((cmd) => cmd.name
                ? Array.isArray(cmd.name)
                    ? cmd.name?.includes(interaction.customId)
                    : cmd.name === interaction.customId
                : !cmd.name);
        }
        if (!commands?.length)
            return;
        for (const command of commands) {
            if (command.name?.includes('$') && command.name !== '$') {
                command.name = Array.isArray(command.name)
                    ? await Promise.all(command.name.map(async (str) => {
                        if (!str.includes('$') && str !== '$')
                            return str;
                        return await INIT({ code: str }, interaction, [interaction.customId], client);
                    }))
                    : await INIT({ code: command.name }, interaction, [interaction.customId], client);
            }
            await INIT(command, interaction, [interaction.customId], client);
        }
    }
    else if (interaction.isModalSubmit()) {
        const commands = client.commands.interactionCreate.modal.filter((cmd) => cmd.name
            ? Array.isArray(cmd.name)
                ? cmd.name?.includes(interaction.customId)
                : cmd.name === interaction.customId
            : !cmd.name);
        if (!commands?.length)
            return;
        for (const command of commands) {
            if (command.name?.includes('$') && command.name !== '$') {
                command.name = Array.isArray(command.name)
                    ? await Promise.all(command.name.map(async (str) => {
                        if (!str.includes('$') && str !== '$')
                            return str;
                        return await INIT({ code: str }, interaction, [interaction.customId], client);
                    }))
                    : await INIT({ code: command.name }, interaction, [interaction.customId], client);
            }
            await INIT(command, interaction, [], client);
        }
    }
    else {
        const commands = client.commands.interactionCreate.slash.filter((cmd) => cmd.name === interaction.commandName);
        if (!commands?.length)
            return;
        for (const command of commands) {
            if ((!!command.subCommand && interaction.options._subcommand !== command.subCommand) ||
                (!!command.subCommandGroup && interaction.options._group !== command.subCommandGroup))
                continue;
            const args = interaction.options?._hoistedOptions?.map((option) => option.value);
            if (command.name?.includes('$') && command.name !== '$') {
                command.name = await INIT({ code: command.name }, interaction, args, client);
            }
            await INIT(command, interaction, args, client);
        }
    }
}
async function INIT(command, interaction, args, client) {
    return ((await index_js_1.Interpreter.run(command, {
        client: client,
        interaction: interaction,
        channel: interaction.channel ?? void 0,
        guild: interaction.guild ?? void 0,
        args: args.filter(Boolean),
        user: interaction.user,
        member: interaction.member ?? void 0
    }))?.result ?? '');
}
