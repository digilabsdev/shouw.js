"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class GetObjectProperty extends index_js_1.Functions {
    constructor() {
        super({
            name: '$getObjectProperty',
            description: 'This function will return the property of the object with the given name and property name',
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
                    name: 'property',
                    description: 'The property name of the object',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name, property]) {
        if (!ctx.hasObject(name))
            return await ctx.error(ctx.constants.Errors.objectNotFound(name), this.name);
        let v = ctx.getObjectProperty(name, property);
        if (typeof v === 'object')
            v = JSON.stringify(v);
        return this.success(v);
    }
}
exports.default = GetObjectProperty;
const example = `
$createObject[myObject;{
    "key": "value"
}]

$getObjectProperty[myObject;key] // returns "value"
`;
