"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class CreateCache extends index_js_1.Functions {
    constructor() {
        super({
            name: '$createCache',
            description: 'This function will create a new cache with the given name',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache to create',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [input]) {
        if (!ctx.hasCache(input))
            ctx.createCache(input);
        return this.success();
    }
}
exports.default = CreateCache;
const example = `
$createCache[test] // creates a new cache with the name test
$createCache[test2] // creates a new cache with the name test2
`;
