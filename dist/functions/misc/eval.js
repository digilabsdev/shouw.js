"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../index.js");
const node_util_1 = require("node:util");
class Eval extends index_js_1.Functions {
    constructor() {
        super({
            name: '$eval',
            description: 'This function will evaluate shouw.js code.',
            brackets: true,
            example,
            params: [
                {
                    name: 'code',
                    description: 'The code to evaluate',
                    required: true,
                    type: index_js_1.ParamType.String
                },
                {
                    name: 'sendMessage',
                    description: 'Whether to send the result as a message',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                },
                {
                    name: 'returnId',
                    description: 'Whether to return the id of the message',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                },
                {
                    name: 'returnResult',
                    description: 'Whether to return the result of the execution',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                },
                {
                    name: 'returnError',
                    description: 'Whether to return the error status of the execution',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                },
                {
                    name: 'returnData',
                    description: 'Whether to return the temporary data',
                    required: false,
                    type: index_js_1.ParamType.Boolean
                }
            ]
        });
    }
    async code(ctx, [code, sendMessage = true, returnId = false, returnResult = true, returnError = false, returnData = false]) {
        const interpreterResult = await index_js_1.Interpreter.run({
            name: 'eval',
            code: code ?? '',
            type: 'parsing'
        }, ctx, {
            sendMessage,
            returnId,
            returnResult,
            returnError,
            returnData
        });
        return this.success(returnId || returnResult || returnError || returnData ? (0, node_util_1.inspect)(interpreterResult, { depth: 0 }) : void 0);
    }
}
exports.default = Eval;
const example = `
$eval[Hello World!] // returns "Hello World!"
$eval[$message] // returns the message content
`;
