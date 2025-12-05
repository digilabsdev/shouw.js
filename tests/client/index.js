// @ts-check

/**
 * Import the ShouwClient class from the shouw.js package.
 */
const { ShouwClient } = require('../..');

/**
 * Initialize the client.
 */
const client = new ShouwClient({
    token: process.env.TOKEN,
    prefix: '+',
    intents: ['Guilds', 'GuildMessages', 'MessageContent', 'AutoModerationConfiguration', 'AutoModerationExecution'],
    debug: true,
    events: [
        'messageCreate',
        'interactionCreate',
        'autoModerationActionExecution',
        'autoModerationRuleCreate',
        'autoModerationRuleDelete',
        'autoModerationRuleUpdate'
    ],
    disableFunctions: ['$clientToken']
});

/**
 * Register a command.
 */
client.command({
    type: 'clientReady',
    code: (ctx) => {
        ctx.client.debug(`Logged in as ${ctx.client.user.tag}!`, void 0, true);
    }
});

/**
 * Set the status of the client.
 */
client.status(
    {
        name: 'Status 1',
        type: 'playing',
        status: 'idle',
        time: 12
    },
    {
        name: 'Status 2',
        type: 'watching',
        status: 'dnd',
        time: 12
    }
);

/**
 * Load the commands from the commands directory.
 */
client.loadCommands('tests/client/commands');
