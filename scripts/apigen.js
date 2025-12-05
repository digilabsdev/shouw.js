// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const functionArray = [];
main(path.join(process.cwd(), 'dist', 'functions'));
write();

/**
 * This function is used to read all the functions in the functions directory and write them to a json file.
 *
 * @param {string} functionDir - The directory of the functions.
 * @returns {void} - Nothing.
 */
function main(functionDir) {
    const files = fs.readdirSync(functionDir);
    for (const file of files) {
        const filePath = path.join(functionDir, file);
        if (fs.statSync(filePath).isDirectory()) {
            main(filePath);
        } else {
            let FunctionClass = void 0;
            try {
                FunctionClass = require(filePath).default;
                // @ts-ignore
                const func = new FunctionClass();
                functionArray.push({
                    name: func.name,
                    description: func.description,
                    all: func.withParams,
                    example: func.example,
                    params: Array.isArray(func.params)
                        ? func.params.map((p) => ({
                              name: p.name,
                              type: p.type,
                              required: p.required,
                              description: p.description
                          }))
                        : []
                });
            } catch (err) {
                console.error(err);
            }
        }
    }
}

/**
 * This function is used to write the functions to a json file.
 *
 * @returns {void} - Nothing.
 */
function write() {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir, { recursive: true });
    const outputPath = path.join(scriptsDir, 'functions.json');
    fs.rmSync(outputPath, { force: true });
    fs.writeFileSync(outputPath, JSON.stringify(functionArray, null, 4));

    console.log(`[!?]  ::  Successfully generated ${functionArray.length} functions!`);
}
