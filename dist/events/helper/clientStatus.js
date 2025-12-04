"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Status;
const index_js_1 = require("../../index.js");
function Status(client) {
    let index = 0;
    const updateStatus = async () => {
        if (index >= client.statuses.size || !client.statuses.get(index))
            index = 0;
        const status = client.statuses.get(index);
        if (!status) {
            index++;
            return setTimeout(updateStatus, 20000);
        }
        let name = status.activities?.[0]?.name;
        if (!name) {
            index++;
            return setTimeout(updateStatus, status.time ?? 20000);
        }
        if (name.includes('$') && name !== '$') {
            const result = await index_js_1.Interpreter.run({ code: name }, { client }, { sendMessage: false });
            if (typeof result?.result === 'string') {
                name = result.result;
                client.statuses.set(index, {
                    ...status,
                    activities: [{ ...status.activities[0], name }]
                });
            }
            else {
                index++;
                return setTimeout(updateStatus, status.time ?? 20000);
            }
        }
        client.user.setPresence(status);
        index++;
        setTimeout(updateStatus, status.time ?? 20000);
    };
    updateStatus();
}
