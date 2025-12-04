"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
async function Events(message, client) {
    if (message.author.bot && !client.shouwOptions.respondToBots)
        return;
    if (!message.inGuild() && client.shouwOptions.guildOnly)
        return;
    const commands = client.commands?.messageCreate?.V;
    if (!commands || !commands.length)
        return;
    AlwaysExecute(message, client, commands);
    const prefixes = await Promise.all(client.prefix.map(async (prefix) => {
        if (!prefix)
            return void 0;
        if (!prefix.match(/\$/g) || prefix === '$')
            return prefix;
        return await INIT({ code: prefix }, message, message.content?.split(/ +/g) ?? [], client);
    }));
    for (const prefix of prefixes.filter((p) => p && p !== '')) {
        if (!prefix)
            continue;
        if (!message.content || !message.content.startsWith(prefix))
            continue;
        const args = message.content?.slice(prefix.length).split(/ +/g) ?? [];
        const commandName = args.shift()?.toLowerCase();
        if (!commandName)
            continue;
        const command = commands.find((cmd) => cmd.name === commandName || cmd.aliases?.includes(commandName));
        if (!command || !command.code)
            break;
        await INIT(command, message, args, client);
        break;
    }
}
async function AlwaysExecute(message, client, commands) {
    const alwaysExecute = commands.filter((v) => !Array.isArray(v.name) ? v.name?.toLowerCase() === '$alwaysexecute' : false);
    if (Array.isArray(alwaysExecute) && alwaysExecute.length > 0) {
        for (const command of alwaysExecute) {
            if (!command || !command.code)
                break;
            await INIT(command, message, message.content?.split(/ +/g) ?? [], client);
        }
    }
}
async function INIT(command, message, args, client) {
    return ((await index_js_1.Interpreter.run(command, {
        client: client,
        channel: message.channel,
        args: args,
        message: message,
        guild: message.guild ?? void 0,
        user: message.author,
        member: message.member ?? void 0
    })).result ?? void 0);
}
