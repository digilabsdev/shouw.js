"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ArrayEvery extends index_js_1.Functions {
    constructor() {
        super({
            name: '$arrayEvery',
            description: 'Check if every element of the array satisfies the given condition',
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
                    name: 'query',
                    description: 'The query to check',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'queryType',
                    description: 'The type of the query',
                    required: false,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [name, query, queryType = '==']) {
        if (!ctx.hasArray(name))
            return await ctx.error(`Array with name '${name}' does not exist.`);
        return this.success(ctx.getArray(name)?.every((x) => ctx.condition(`${x}${queryType}${query}`)));
    }
}
exports.default = ArrayEvery;
const example = `
$createArray[array1;1;2;3;4;5]
$arrayEvery[array1;1;==] // return false
$arrayEvery[array1;1;>=] // return true

$createArray[array2;1;1;1;1;1]
$arrayEvery[array2;1;==] // return true
`;
