"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class HasCacheData extends index_js_1.Functions {
    constructor() {
        super({
            name: '$hasCacheData',
            description: 'This function will return true if the cache data with the given name and key exists',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'key',
                    description: 'The key of the cache data to check',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [name, key]) {
        return this.success(ctx.hasCacheData(name, key));
    }
}
exports.default = HasCacheData;
const example = `
$createCache[test]
$setCacheData[test;key;value]
$hasCacheData[test;key] // returns true

$hasCacheData[test;key2] // returns false
`;
