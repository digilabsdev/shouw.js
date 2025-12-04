"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
const node_util_1 = require("node:util");
class DjsEval extends index_js_1.Functions {
    constructor() {
        super({
            name: '$djsEval',
            description: 'This function will evaluate javascript code.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'input',
                    description: 'The code to execute.',
                    required: true,
                    type: index_js_1.ParamType.String
                }
            ]
        });
    }
    async code(ctx, arr) {
        const { client, guild, member, user, message, interaction, channel } = ctx;
        const returnResult = arr.length >= 2 ? (arr.pop() === 'true') : false;
        const input = arr.join(';');
        try {
            const result = await eval(input);
            return returnResult ? this.success((0, node_util_1.inspect)(result, { depth: 0 })) : this.success();
        }
        catch (err) {
            return await ctx.error(err, this.name);
        }
    }
}
exports.default = DjsEval;
const example = `
$djsEval[console.log("Hello World!")] // logs "Hello World!" to the console

$djsEval[console.log("Hello World!");true] // logs "Hello World!" to the console and returns it
`;
