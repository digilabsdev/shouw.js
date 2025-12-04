"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class SetCacheData extends index_js_1.Functions {
    constructor() {
        super({
            name: '$setCacheData',
            description: 'This function will set the cache data with the given name and key',
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
                    description: 'The key of the cache data to set',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'value',
                    description: 'The value of the cache data to set',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name, key, value]) {
        if (!ctx.hasCache(name))
            return await ctx.error(ctx.constants.Errors.cacheNotFound(name), this.name);
        ctx.setCacheData(name, key, value);
        return this.success();
    }
}
exports.default = SetCacheData;
const example = `
$createCache[test]
$setCacheData[test;key;value]
// sets the cache data with the name test and key key to value value
`;
