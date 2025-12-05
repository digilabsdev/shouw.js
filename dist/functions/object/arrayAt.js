"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ArrayAt extends index_js_1.Functions {
    constructor() {
        super({
            name: '$arrayAt',
            description: 'Return the element at the given index of the array',
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
                    name: 'index',
                    description: 'The index of the element to return',
                    required: true,
                    type: index_js_1.ParamType.Number
                }
            ]
        });
    }
    async code(ctx, [name, index]) {
        if (!ctx.hasArray(name))
            return await ctx.error(`Array with name '${name}' does not exist.`);
        return this.success(ctx.getArrayIndex(name, index));
    }
}
exports.default = ArrayAt;
const example = `
$createArray[array;1;2;3;4;5]

$arrayAt[array;1] // return 1
$arrayAt[array;3] // return 3
`;
