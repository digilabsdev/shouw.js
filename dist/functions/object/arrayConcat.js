"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ArrayConcat extends index_js_1.Functions {
    constructor() {
        super({
            name: '$arrayConcat',
            description: 'Concat the given arrays and return the result',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'separator',
                    description: 'The separator to use between the elements',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'names',
                    description: 'The names of the arrays to concat',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, [separator = ', ', ...names]) {
        const concated = names
            .flatMap((name) => {
            if (!ctx.hasArray(name))
                return ctx.error(`Array with name '${name}' does not exist.`);
            return ctx.getArray(name);
        })
            .join(separator);
        return this.success(concated);
    }
}
exports.default = ArrayConcat;
const example = `
$createArray[array1;1;2;3]
$createArray[array2;4;5;6]

$arrayConcat[;array1;array2] // return 1, 2, 3, 4, 5, 6
`;
