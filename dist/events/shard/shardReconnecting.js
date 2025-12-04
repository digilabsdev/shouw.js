"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
async function Events(shardId, client) {
    const commands = client.commands?.shardReconnecting?.V;
    if (!commands || !commands.length)
        return;
    for (const command of commands) {
        if (!command || !command.code)
            break;
        let channel;
        let guild;
        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get((await index_js_1.Interpreter.run({ code: command.channel }, {
                client,
                Temporarily: {
                    shardEvent: { id: shardId, type: 'reconnecting' }
                }
            }, { sendMessage: false }))?.result ?? '');
            guild = channel?.guild;
        }
        await index_js_1.Interpreter.run(command, {
            client: client,
            Temporarily: {
                shardEvent: {
                    id: shardId,
                    type: 'reconnecting'
                }
            },
            guild,
            channel
        });
    }
}
