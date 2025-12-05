import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class ArrayEvery extends Functions {
    constructor() {
        super({
            name: '$arrayEvery',
            description: 'Check if every element of the array satisfies the given condition',
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
                    name: 'query',
                    description: 'The query to check',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'queryType',
                    description: 'The type of the query',
                    required: false,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [name, query, queryType = '==']: [string, number, string]) {
        if (!ctx.hasArray(name)) return await ctx.error(`Array with name '${name}' does not exist.`);
        return this.success((ctx.getArray(name) as any)?.every((x: any) => ctx.condition(`${x}${queryType}${query}`)));
    }
}

const example = `
$createArray[array1;1;2;3;4;5]
$arrayEvery[array1;1;==] // return false
$arrayEvery[array1;1;>=] // return true

$createArray[array2;1;1;1;1;1]
$arrayEvery[array2;1;==] // return true
`;
