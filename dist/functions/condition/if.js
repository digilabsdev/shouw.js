"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class If extends index_js_1.Functions {
    constructor() {
        super({
            name: '$if',
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
}
exports.default = If;
const example = `
$if[true]
    This will run
$elseIf[false]
    This will not run
$else
    This will not run
$endIf
`;
