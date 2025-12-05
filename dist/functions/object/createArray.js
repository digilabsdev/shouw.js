"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CreateArray extends index_js_1.Functions {
    constructor() {
        super({
            name: '$createArray',
            description: 'Creates an array with the given name and elements',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the array',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'elements',
                    description: 'The elements of the array',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [name, elements]) {
        const data = elements.split(';').map((x) => x.trim().unescape());
        ctx.setArray(name, data);
        return this.success();
    }
}
exports.default = CreateArray;
const example = `
$createArray[array;1;2;3;4;5]

$arrayAt[array;1] // return 1
$arrayAt[array;3] // return 3
`;
