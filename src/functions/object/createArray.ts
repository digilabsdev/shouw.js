import { ParamType, Functions, type Interpreter } from '../../index.js';

export default class CreateArray extends Functions {
    constructor() {
        super({
            name: '$createArray',
            description: 'Creates an array with the given name and elements',
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
                    name: 'elements',
                    description: 'The elements of the array',
                    required: true,
                    type: ParamType.String,
                    rest: true
                }
            ]
        });
    }

    code(ctx: Interpreter, [name, elements]: [string, string]) {
        const data = elements.split(';').map((x) => x.trim().unescape());
        ctx.setArray(name, data);
        return this.success();
    }
}

const example = `
$createArray[array;1;2;3;4;5]

$arrayAt[array;1] // return 1
$arrayAt[array;3] // return 3
`;
