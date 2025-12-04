"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Log extends index_js_1.Functions {
    constructor() {
        super({
            name: '$log',
            description: 'This function will log the input to the console.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The input to log.',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(_ctx, [input]) {
        console.log(input);
        return this.success();
    }
}
exports.default = Log;
const example = `
$log[Hello World!] // logs "Hello World!" to the console
`;
