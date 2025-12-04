"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
class Get extends index_js_1.Functions {
    constructor() {
        super({
            name: '$get',
            description: 'This will retrieve temporary variables stored ny $let or $const',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'varname',
                    description: 'Temporary variable you want to retrieve',
                    required: true,
                    type: index_js_1.ParamType.String,
                    rest: true
                }
            ]
        });
    }
    async code(ctx, [varname]) {
        if (!ctx.hasVariable(varname) && !ctx.hasConstantVariable(varname))
            return await ctx.error(ctx.constants.Errors.variableNotFound(varname), this.name);
        return this.success(ctx.getVariable(varname) ?? ctx.getConstantVariable(varname));
    }
}
exports.default = Get;
const example = `
$let[varname;value] // Stores a temporary variable with the name 'varname' and the value 'value'
$get[varname] // Returns the value of the temporary variable with the name 'varname'
`;
