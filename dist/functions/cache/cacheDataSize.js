"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CacheDataSize extends index_js_1.Functions {
    constructor() {
        super({
            name: '$cacheDataSize',
            description: 'This function returns the size of the cache data',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache data to get the size of',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [name]) {
        if (!ctx.hasCache(name))
            return await ctx.error(ctx.constants.Errors.cacheNotFound(name), this.name);
        return this.success(ctx.getCacheSize(name));
    }
}
exports.default = CacheDataSize;
const example = `
$createCache[test]
$setCacheData[test;key;value]
$cacheDataSize[test]  // returns 1

$cacheDataSize[test2] // returns error, cache not found
`;
