"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class GetCacheData extends index_js_1.Functions {
    constructor() {
        super({
            name: '$getCacheData',
            description: 'This function will return the cache data with the given name and key',
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
                    description: 'The key of the cache data to get',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name, key]) {
        if (!ctx.hasCache(name))
            return await ctx.error(ctx.constants.Errors.cacheNotFound(name), this.name);
        return this.success(ctx.getCacheData(name, key));
    }
}
exports.default = GetCacheData;
const example = `
$createCache[test]
$setCacheData[test;key;value]
$getCacheData[test;key] // returns value

$getCacheData[test;key2] // returns nothing 
`;
