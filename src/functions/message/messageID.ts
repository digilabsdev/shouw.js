import { Functions, type Interpreter } from '../../index.js';

export default class MessageID extends Functions {
    constructor() {
        super({
            name: '$messageID',
            description: 'This function will return the ID of the current message.',
            brackets: false,
            example
        });
    }

    code(ctx: Interpreter) {
        return this.success(ctx.message?.id || '');
    }
}

const example = `
$messageID // returns the ID of the current message
`;
