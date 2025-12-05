"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
async function Events(rule, client) {
    const commands = client.commands?.autoModerationRuleDelete?.V;
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
                Temporarily: { rule },
                user: client.users.cache.get(rule.creatorId)
            }, { sendMessage: false }))?.result ?? '');
            guild = channel?.guild;
        }
        await index_js_1.Interpreter.run(command, {
            client: client,
            Temporarily: { rule },
            guild,
            channel,
            user: client.users.cache.get(rule.creatorId),
            member: guild?.members.cache.get(rule.creatorId)
        });
    }
}
