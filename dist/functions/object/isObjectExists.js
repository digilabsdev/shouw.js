"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class IsObjectExists extends index_js_1.Functions {
    constructor() {
        super({
            name: '$isObjectExists',
            description: 'This function will return true if the object with the given name exists',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the object',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [name]) {
        return this.success(ctx.hasObject(name));
    }
}
exports.default = IsObjectExists;
const example = `
$createObject[myObject;{
    "key": "value"
}]

$isObjectExists[myObject] // returns true
`;
