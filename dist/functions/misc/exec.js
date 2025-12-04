"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
const node_child_process_1 = require("node:child_process");
class Exec extends index_js_1.Functions {
    constructor() {
        super({
            name: '$exec',
            description: 'Executes a command in the terminal.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The command to execute.',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(_ctx, [input]) {
        try {
            return this.success((0, node_child_process_1.execSync)(input).toString());
        }
        catch (err) {
            return this.success(err);
        }
    }
}
exports.default = Exec;
const example = `
$exec[echo Hello World!] // returns "Hello World!"
$exec[npm i shouw.js] // installs shouw.js
`;
