"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Wait extends index_js_1.Functions {
    constructor() {
        super({
            name: '$wait',
            description: 'This function will wait for the given time.',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'time',
                    description: 'The time to wait for.',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [time]) {
        const timer = Number.isNaN(Number(time)) ? ctx.time.parse(time).ms || 0 : Number(time);
        await ctx.sleep(Number(timer));
        return this.success();
    }
}
exports.default = Wait;
const example = `
$wait[1s] // Wait for 1 second
$wait[1m] // Wait for 1 minute
$wait[10m] // Wait for 10 minutes
`;
