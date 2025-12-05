import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class ArrayAt extends Functions {
    constructor() {
        super({
            name: '$arrayAt',
            description: 'Return the element at the given index of the array',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'name',
                    description: 'The name of the array',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'index',
                    description: 'The index of the element to return',
                    required: true,
                    type: ParamType.Number
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, index]: [string, number]) {
        if (!ctx.hasArray(name)) return await ctx.error(`Array with name '${name}' does not exist.`);
        return this.success(ctx.getArrayIndex(name, index));
    }
}

const example = `
$createArray[array;1;2;3;4;5]

$arrayAt[array;1] // return 1
$arrayAt[array;3] // return 3
`;
