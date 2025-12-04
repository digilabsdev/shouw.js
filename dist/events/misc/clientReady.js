"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const index_js_1 = require("../../index.js");
const clientStatus_js_1 = __importDefault(require("../helper/clientStatus.js"));
async function Events(client) {
    (0, clientStatus_js_1.default)(client);
    if (client.shouwOptions.shouwLogs) {
        index_js_1.ConsoleDisplay.displayConsole('Shouw.js', 'white', [
            { text: `Logged in as ${client.user?.tag}`, color: 'green' },
            { text: `Installed on version v${index_js_1.Constants.Version}`, color: 'cyan' }
        ]);
    }
    const commands = client.commands?.ready?.V;
    if (!commands)
        return;
    for (const command of commands) {
        if (!command || !command.code)
            break;
        let channel;
        let guild;
        if (command.channel?.includes('$') && command.channel !== '$') {
            channel = client.channels.cache.get((await index_js_1.Interpreter.run({ code: command.channel }, { client }, { sendMessage: false }))?.result ?? '');
            guild = channel?.guild;
        }
        await index_js_1.Interpreter.run(command, {
            client,
            guild,
            channel
        });
    }
}
