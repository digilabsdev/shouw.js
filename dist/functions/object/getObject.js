"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class GetObject extends index_js_1.Functions {
    constructor() {
        super({
            name: '$getObject',
            description: 'This function will return the object with the given name',
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
    async code(ctx, [name]) {
        if (!ctx.hasObject(name))
            return await ctx.error(ctx.constants.Errors.objectNotFound(name), this.name);
        return this.success(JSON.stringify(ctx.getObject(name)));
    }
}
exports.default = GetObject;
const example = `
$createObject[myObject;{
    "key": "value"
}]

$getObject[myObject] // returns { "key": "value" }
`;
