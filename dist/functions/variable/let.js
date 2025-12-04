"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Let extends index_js_1.Functions {
    constructor() {
        super({
            name: '$let',
            description: 'This will store temporary variables which can be retrieved by $get',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'varname',
                    description: 'Name of the temporary variable',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'value',
                    description: 'Value of the temporary variable you want to save',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [varname, value]) {
        if (ctx.hasConstantVariable(varname))
            return await ctx.error(ctx.constants.Errors.constantVariable(varname), this.name);
        ctx.setVariable(varname, value);
        return this.success();
    }
}
exports.default = Let;
const example = `
$let[varname;value] // Stores a temporary variable with the name 'varname' and the value 'value'
$get[varname] // Returns the value of the temporary variable with the name 'varname'
`;
