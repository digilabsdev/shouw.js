"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SplitText extends index_js_1.Functions {
    constructor() {
        super({
            name: '$splitText',
            description: 'This function will return the split of the text with the given index.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'index',
                    description: 'The index of the split to return.',
                    required: true,
                    type: index_js_1.ParamType.Number,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [index = 1]) {
        return this.success(ctx.getSplit(index - 1));
    }
}
exports.default = SplitText;
const example = `
$textSplit[Hello World!; ]

$splitText[1] // returns "Hello"
$splitText[2] // returns "World!"
`;
