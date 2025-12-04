"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class DeleteCache extends index_js_1.Functions {
    constructor() {
        super({
            name: '$deleteCache',
            description: 'This function will delete the cache with the given name',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache to delete',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [input]) {
        if (!ctx.hasCache(input))
            return await ctx.error(ctx.constants.Errors.cacheNotFound(input), this.name);
        ctx.deleteCache(input);
        return this.success();
    }
}
exports.default = DeleteCache;
const example = `
$createCache[test]
$deleteCache[test] // deletes the cache with the name test

$deleteCache[test2] // returns error, cache not found
`;
