"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CreateObject extends index_js_1.Functions {
    constructor() {
        super({
            name: '$createObject',
            description: 'Creates an object with the given name and value',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value of the object',
                    required: true,
                    type: index_js_1.ParamType.Object,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [name, value]) {
        ctx.setObject(name, value);
        return this.success();
    }
}
exports.default = CreateObject;
const example = `
$createObject[myObject;{
    "key": "value"
}]

$getObjectProperty[myObject;key] // returns "value"
`;
