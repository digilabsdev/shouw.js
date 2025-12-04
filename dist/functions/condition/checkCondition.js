"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CheckCondition extends index_js_1.Functions {
    constructor() {
        super({
            name: '$checkCondition',
            description: 'This function checks if a condition is true or false',
            brackets: true,
            example,
            params: [
                {
                    name: 'condition',
                    description: 'The condition you want to check',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [condition]) {
        return this.success(condition && condition !== '' ? ctx.condition(condition) : false);
    }
}
exports.default = CheckCondition;
const example = `
$checkCondition[true] // returns true
$checkCondition[false] // returns false

$checkCondition[uwu==uwu] // returns true
$checkCondition[(uwu!=meow)&&(uwu!=owo)] // returns true
`;
