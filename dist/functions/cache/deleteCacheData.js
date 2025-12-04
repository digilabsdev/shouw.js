"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class DeleteCacheData extends index_js_1.Functions {
    constructor() {
        super({
            name: '$deleteCacheData',
            description: 'This function will delete the cache data with the given name and key',
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
                    description: 'The key of the cache data to delete',
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
        ctx.deleteCacheData(name, key);
        return this.success();
    }
}
exports.default = DeleteCacheData;
const example = `
$createCache[test]
$setCacheData[test;key;value]
$deleteCacheData[test;key] // deletes the cache data with the name test and key key

$deleteCacheData[test;key2] // returns error, cache data not found
`;
