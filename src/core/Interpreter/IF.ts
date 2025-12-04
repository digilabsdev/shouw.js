import { type Interpreter, Constants } from '../../index.js';

export interface IFBlockResult {
    code: string;
    error: boolean;
    index: number;
    length: number;
}

/**
 * The IF class handles the $if block in the code.
 *
 * @class IF
 * @param {string} code - The code to be processed.
 * @param {Interpreter} ctx - The interpreter context.
 * @param {number} index - The index of the code to be processed.
 * @return {Promise<IFBlockResult>} The modified code and whether there was an error.
 */
export class IF {
    /**
     * The code to be processed.
     */
    private readonly code: string;

    /**
     * The interpreter context.
     */
    private readonly ctx: Interpreter;

    /**
     * The index of the code to be processed.
     */
    private readonly index: number;

    constructor(code: string, ctx: Interpreter, index: number) {
        this.code = code;
        this.ctx = ctx;
        this.index = index;
    }

    /**
     * Runs the $if block in the code and returns the modified code.
     *
     * @param {string} code - The code to be processed.
     * @param {Interpreter} ctx - The interpreter context.
     * @param {number} index - The index of the code to be processed.
     * @return {Promise<IFBlockResult>} The modified code and whether there was an error.
     */
    public static async run(code: string, ctx: Interpreter, index: number): Promise<IFBlockResult> {
        return await new IF(code, ctx, index).initialize();
    }

    /**
     * Handles the $if block in the code and returns the modified code.
     *
     * @return {Promise<IFBlockResult>} The modified code and whether there was an error.
     */
    private async initialize(): Promise<IFBlockResult> {
        const lower = this.code.toLowerCase();
        if (!lower.includes('$if[')) return { code: this.code, error: false, index: 0, length: 0 };

        if (!lower.includes('$endif')) {
            await this.ctx.error(Constants.Errors.missingEndif);
            return { code: this.code, error: true, index: 0, length: 0 };
        }

        const startIndex = lower.indexOf('$if[', this.index);
        const block = this.extractTopLevelBlock(this.code.slice(startIndex), '$if[', '$endif');

        if (!block) {
            await this.ctx.error(Constants.Errors.missingEndif);
            return { code: this.code, error: true, index: 0, length: 0 };
        }

        const { full } = block;
        const branches = this.parseBranches(full);
        let output = '';
        let matched = false;

        for (const branch of branches) {
            const isConditionBranch = branch.type === 'if' || branch.type === 'elseif';

            if (isConditionBranch && !matched) {
                const result = branch.condition
                    ? // @ts-ignore
                      await this.ctx.processFunction(`$checkCondition[${branch.condition}]`)
                    : 'false';
                if (result === 'true') {
                    output = branch.code;
                    matched = true;
                }
            } else if (branch.type === 'else' && !matched) {
                output = branch.code;
                break;
            }
        }

        const result = this.code.slice(0, startIndex) + output + this.code.slice(startIndex + full.length);
        return {
            code: result,
            error: false,
            index: startIndex,
            length: output.length
        };
    }

    /**
     * Parses the branches of an $if block.
     *
     * @param {string} full - The full code of the $if block.
     * @return {Array<{ type: string; condition: string; code: string }>} The parsed branches.
     */
    private parseBranches(full: string): Array<{ type: string; condition: string; code: string }> {
        const branches: Array<{
            type: string;
            condition: string;
            index: number;
        }> = [];
        const result: Array<{ type: string; condition: string; code: string }> = [];

        let i = 0;
        let depth = -1;
        while (i < full.length) {
            const lower = full.slice(i).toLowerCase();

            if (lower.startsWith('$if[')) {
                depth++;
                if (depth === 0) {
                    const condition = this.extractCondition(full.slice(i));
                    branches.push({ type: 'if', condition, index: i });
                    i += 4 + condition.length + 1;
                    continue;
                }
            } else if (lower.startsWith('$endif')) {
                depth--;
                if (depth === -1) {
                    branches.push({ type: 'endif', condition: '', index: i });
                    i += 6;
                    break;
                }
            }

            if (depth !== 0) {
                i++;
                continue;
            }

            if (lower.startsWith('$elseif[')) {
                const condition = this.extractCondition(full.slice(i));
                branches.push({ type: 'elseif', condition, index: i });
                i += 8 + condition.length + 1;
            } else if (lower.startsWith('$else')) {
                branches.push({ type: 'else', condition: '', index: i });
                i += 5;
            } else {
                i++;
            }
        }

        for (let j = 0; j < branches.length; j++) {
            const { type, condition, index } = branches[j];
            const nextIndex = branches[j + 1]?.index ?? full.length;

            let contentStart = index;
            if (type === 'if') contentStart += 4 + condition.length + 1;
            else if (type === 'elseif') contentStart += 8 + condition.length + 1;
            else if (type === 'else') contentStart += 5;
            else if (type === 'endif') contentStart += 6;

            const code = full.slice(contentStart, nextIndex).trim();
            result.push({ type, condition, code });
        }

        return result;
    }

    /**
     * Extracts the top-level block from the code.
     *
     * @param {string} str - The code to be processed.
     * @param {string} open - The opening tag of the block.
     * @param {string} close - The closing tag of the block.
     * @return {{ full: string, body: string } | null} The extracted block.
     */
    private extractTopLevelBlock(
        str: string,
        open: string,
        close: string
    ): {
        full: string;
        body: string;
    } | null {
        let depth = 0;
        let start = -1;
        let i = 0;

        while (i < str.length) {
            if (str.toLowerCase().startsWith(open, i)) {
                if (depth === 0) start = i;
                depth++;
                i += open.length;
            } else if (str.toLowerCase().startsWith(close, i)) {
                depth--;
                i += close.length;

                if (depth === 0 && start !== -1) {
                    return {
                        full: str.slice(0, i),
                        body: str.slice(open.length, i - close.length)
                    };
                }
            } else {
                i++;
            }
        }
        return null;
    }

    /**
     * Extracts the condition from the code.
     *
     * @param {string} str - The code to be processed.
     * @return {string} The extracted condition.
     */
    private extractCondition(str: string): string {
        let depth = 0;
        let start = -1;

        for (let i = 0; i < str.length; i++) {
            if (str[i] === '[') {
                if (depth === 0) start = i;
                depth++;
            } else if (str[i] === ']') {
                depth--;
                if (depth === 0) return str.slice(start + 1, i);
            }
        }
        return '';
    }
}
