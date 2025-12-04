"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class HasCache extends index_js_1.Functions {
    constructor() {
        super({
            name: '$hasCache',
            description: 'This function will return true if the cache with the given name exists',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the cache to check',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    code(ctx, [input]) {
        return this.success(ctx.hasCache(input));
    }
}
exports.default = HasCache;
const example = `
$createCache[test]
$hasCache[test] // returns true
$hasCache[test2] // returns false
`;
