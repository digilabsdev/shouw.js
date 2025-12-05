import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class ArrayConcat extends Functions {
    constructor() {
        super({
            name: '$arrayConcat',
            description: 'Concat the given arrays and return the result',
            brackets: true,
            escapeArguments: true,
            example,
            params: [
                {
                    name: 'separator',
                    description: 'The separator to use between the elements',
                    required: true,
                    type: ParamType.String
                },
                {
                    name: 'names',
                    description: 'The names of the arrays to concat',
                    required: true,
                    type: ParamType.String
                }
            ]
        });
    }

    async code(ctx: Interpreter, [separator = ', ', ...names]: [string, string]) {
        const concated = names
            .flatMap((name: string) => {
                if (!ctx.hasArray(name)) return ctx.error(`Array with name '${name}' does not exist.`);
                return ctx.getArray(name);
            })
            .join(separator);

        return this.success(concated);
    }
}

const example = `
$createArray[array1;1;2;3]
$createArray[array2;4;5;6]

$arrayConcat[;array1;array2] // return 1, 2, 3, 4, 5, 6
`;
