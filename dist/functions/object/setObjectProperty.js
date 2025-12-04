"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SetObjectProperty extends index_js_1.Functions {
    constructor() {
        super({
            name: '$setObjectProperty',
            description: 'This function will set the property of the object with the given name and property name',
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
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value to set',
                    required: true,
                    type: index_js_1.ParamType.Any,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name, property, value]) {
        if (!ctx.hasObject(name))
            return await ctx.error(ctx.constants.Errors.objectNotFound(name), this.name);
        let v = value;
        try {
            v = JSON.parse(value);
        }
        catch {
            v = value;
        }
        ctx.setObjectProperty(name, property, v);
        return this.success();
    }
}
exports.default = SetObjectProperty;
const example = `
$createObject[myObject;{
    "key": "value"
}]

$setObjectProperty[myObject;key;newValue] // sets the property key of the object myObject to newValue
$getObjectProperty[myObject;key] // returns newValue
`;
