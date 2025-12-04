"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Ternary extends index_js_1.Functions {
    constructor() {
        super({
            name: '$ternary',
            description: 'This function will check a condition wether true or false and return the result',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'trueResult',
                    description: 'The result if the condition is true',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'falseResult',
                    description: 'The result if the condition is false',
                    required: false,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [condition, trueResult, falseResult]) {
        return this.success(ctx.condition(condition) ? trueResult : (falseResult ?? ''));
    }
}
exports.default = Ternary;
const example = `
$ternary[true;This will run;This will not run] // returns This will run
$ternary[false;This will not run;This will run] // returns This will run
`;
