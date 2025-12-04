"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class ObjectHasOwn extends index_js_1.Functions {
    constructor() {
        super({
            name: '$objectHasOwn',
            description: 'This function will return true if the object has the given property',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'object',
                    description: 'The object to check',
                    required: true,
                    type: index_js_1.ParamType.Object
                },
                {
                    name: 'property',
                    description: 'The property to check',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(_ctx, [object, property]) {
        return this.success(Object.hasOwn(object, property));
    }
}
exports.default = ObjectHasOwn;
const example = `
$objectHasOwn[{ "key": "value" };key] // returns true
`;
