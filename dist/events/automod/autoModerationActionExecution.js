"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
async function Events(action, client) {
    const commands = client.commands?.autoModerationActionExecution?.V;
    if (!commands || !commands.length)
        return;
    for (const command of commands) {
        if (!command || !command.code)
            break;
        let channel;
        let guild;
        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get((await index_js_1.Interpreter.run({
                code: command.channel
            }, {
                client,
                Temporarily: { action },
                user: action.user ?? void 0,
                member: action.member ?? void 0,
                guild: action.guild,
                channel: action.channel,
                message: action.channel?.messages?.cache.get(action.messageId),
                args: action.content?.trim()?.split(/ +/)
            }, { sendMessage: false }))?.result ?? '');
            guild = channel?.guild;
        }
        await index_js_1.Interpreter.run(command, {
            client,
            Temporarily: { action },
            user: action.user ?? void 0,
            member: action.member ?? void 0,
            guild: action.guild,
            channel: action.channel,
            message: action.channel?.messages?.cache.get(action.messageId),
            args: action.content?.trim()?.split(/ +/)
        });
    }
}
