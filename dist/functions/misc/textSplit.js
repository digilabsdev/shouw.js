"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class TextSplit extends index_js_1.Functions {
    constructor() {
        super({
            name: '$textSplit',
            description: 'This function will split a string into an array of strings.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The input to split.',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'separator',
                    description: 'The separator to split by.',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [input, separator]) {
        ctx.setSplits(input.split(separator));
        return this.success();
    }
}
exports.default = TextSplit;
const example = `
$textSplit[Hello World!; ]

$splitText[1] // returns "Hello"
$splitText[2] // returns "World!"
`;
