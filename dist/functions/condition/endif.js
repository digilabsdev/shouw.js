"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Endif extends index_js_1.Functions {
    constructor() {
        super({
            name: '$endif',
            description: 'This function ends an if statement',
            brackets: false,
            example
        });
    }
    async code(ctx) {
        return await ctx.error(ctx.constants.Errors.outsideIfStatement, this.name);
    }
}
exports.default = Endif;
const example = `
$if[true]
    This will run
$endif
`;
