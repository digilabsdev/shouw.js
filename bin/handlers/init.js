// @ts-check

const { log } = require('./utils.js');
const { existsSync, mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const chalk = require('chalk');
const readline = require('node:readline');
const { execSync } = require('node:child_process');

/**
 * This function is used to initialize a new Shouw.js project.
 *
 * @param {string[]} _args - The arguments passed to the command.
 * @returns {Promise<void>} - Nothing.
 */
exports.InitCommand = async (_args) => {
    const line = '='.repeat(process.stdout.columns);
    console.log(line);
    console.log('\n');
    log('You can skip these questions by leaving it blank or answer --exit to cancel the process.');
    console.log('\n');

    const name = await getName();
    if (name === '--exit') return log('Exiting...', 'EXIT');

    const description = await getDescription();
    if (description === '--exit') return log('Exiting...', 'EXIT');

    const musicOpt = await withMusic();
    if (musicOpt === '--exit') return log('Exiting...', 'EXIT');
    const music = musicOpt === 'y';

    const token = await getToken();
    if (token === '--exit') return log('Exiting...', 'EXIT');

    const prefix = await getPrefix();
    if (prefix === '--exit') return log('Exiting...', 'EXIT');

    console.log('\n');

    if (!existsSync(name)) {
        log(`Creating project directory ${name}...`);
        mkdirSync(name);
    } else {
        log(`Project directory ${name} already exists.`, 'WARN');
        return process.exit(1);
    }

    log('Creating package.json...');
    writeFileSync(join(name, 'package.json'), getPackageJson(name, description, music));

    log('Creating index.js...');
    writeFileSync(join(name, 'index.js'), getIndexJs(music, token, prefix));

    log('Creating commands directory...');
    const commandsDir = join(name, 'commands');
    mkdirSync(commandsDir);
    const [helloCmd, hiSho] = getCommands();
    writeFileSync(join(commandsDir, 'hello.js'), helloCmd);
    writeFileSync(join(commandsDir, 'hi.sho'), hiSho);

    log('Installing dependencies...');
    try {
        execSync(`cd ${name} && npm install`, { stdio: 'inherit' });
    } catch {
        log('Dependency installation failed.', 'ERROR');
        return process.exit(1);
    }

    console.log('\n');
    log('DONE!');
    log(`You can start your project by running ${chalk.bold(`cd ${name} && npm start`)}`);
    console.log('\n');
    console.log(line);
};

/**
 * This function is used to ask a question to the user.
 *
 * @param {string} query - The question to ask.
 * @returns {Promise<string>} - The answer to the question.
 */
async function question(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise((resolve) => rl.question(formatQuestion(query), resolve));
    rl.close();
    return answer.trim();
}

/**
 * This function is used to get the project name.
 *
 * @returns {Promise<string>} - The project name.
 */
async function getName() {
    const name = await question('Enter your project name');
    if (!name) return 'shouw.js';
    return name.toLowerCase().replace(/ |\//g, '-');
}

/**
 * This function is used to get the bot prefix.
 *
 * @returns {Promise<string>} - The bot prefix.
 */
async function getPrefix() {
    const prefix = await question('Enter your bot prefix');
    if (!prefix) return '!';
    return prefix;
}
/**
 * This function is used to get the project description.
 *
 * @returns {Promise<string>} - The project description.
 */
async function getDescription() {
    const desc = await question('Enter your project description');
    if (!desc) return "A simple string package that helps you interact with Discord's API easily.";
    return desc;
}

/**
 * This function is used to get the bot token.
 *
 * @returns {Promise<string>} - The bot token.
 */
async function getToken() {
    const token = await question('Enter your bot token');
    if (!token) return 'YOUR_TOKEN_HERE';
    return token;
}

/**
 * This function is used to ask if the user wants to use the music extension.
 *
 * @returns {Promise<string>} - True if the user wants to use the music extension, false otherwise.
 */
async function withMusic() {
    const input = await question('Do you want to use music extension? (y/n)');
    if (!input) return 'n';
    return input.toLowerCase();
}

/**
 * This function is used to format the question.
 *
 * @param {string} query - The question to format.
 * @returns {string} - The formatted question.
 */
function formatQuestion(query) {
    return `${chalk.bold(`[${chalk.blue('?!')}]`)} :: ${query}: `;
}

/**
 * This function is used to get the package.json file.
 *
 * @param {string} name - The project name.
 * @param {string} description - The project description.
 * @param {boolean} music - True if the user wants to use the music extension, false otherwise.
 * @returns {string} - The package.json file.
 */
function getPackageJson(name, description, music) {
    const dependencies = {
        'shouw.js': 'github:digilabsdev/shouw.js'
    };
    if (music) {
        dependencies['shouw.music'] = 'github:digilabsdev/music';
        dependencies['ffmpeg-static'] = 'latest';
    }

    return JSON.stringify(
        {
            name,
            version: '1.0.0',
            description,
            main: 'index.js',
            scripts: {
                start: 'node index.js'
            },
            keywords: [],
            author: 'You',
            license: 'ISC',
            dependencies
        },
        null,
        4
    );
}

/**
 * This function is used to get the index.js file.
 *
 * @param {boolean} music - True if the user wants to use the music extension, false otherwise.
 * @param {string} token - The bot token.
 * @returns {string} - The index.js file.
 */

function getIndexJs(music, token, prefix) {
    return `const { ShouwClient } = require('shouw.js');${
        music
            ? `const { ShouwMusic, Events } = require('shouw.music');

const music = new ShouwMusic({
    events: [Events.PlayerStart],
    youtube: {
        streamOptions: {
            useClient: 'WEB_EMBEDDED'
        },
        generateWithPoToken: true
    }
});\n`
            : ''
    }

const client = new ShouwClient({
    token: ${token === 'process.env.TOKEN' ? 'process.env.TOKEN' : `'${token}'`},${
        music
            ? `
    extensions: [music],`
            : ''
    }
    prefix: '${prefix}',
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    events: ['messageCreate'],
});

client.command({
    name: 'ping',
    code: 'Pong! $pingms'
});

client.loadCommands('./commands');
`;
}

/**
 * This function is used to get the commands.
 *
 * @returns {string[]} - The commands.
 */
function getCommands() {
    return [
        `module.exports = {
    name: 'hello',
    code: 'Hello command!'
};`,
        `@Command({
    name: 'hi'
})

Hi command!
`
    ];
}
