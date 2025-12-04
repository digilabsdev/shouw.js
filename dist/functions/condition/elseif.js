"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ElseIf extends index_js_1.Functions {
    constructor() {
        super({
            name: '$elseIf',
            description: 'This function checks if a condition is true or false',
            brackets: true,
            example,
            params: [
                {
                    name: 'condition',
                    description: 'The condition to check',
                    type: index_js_1.ParamType.String,
                    required: true,
                    rest: true
                }
            ]
        });
    }
    async code(ctx) {
        return await ctx.error(ctx.constants.Errors.outsideIfStatement, this.name);
    }
}
exports.default = ElseIf;
const example = `
$if[false]
    This will not run
$elseIf[true]
    This will run
$endIf
`;
