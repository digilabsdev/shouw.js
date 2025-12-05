// @ts-check

/**
 * @type {import('../../..').CommandData[]}
 */
exports.default = [
    {
        type: 'autoModerationActionExecution',
        code: (ctx) => {
            ctx.client.debug('AutoModerationActionExecution event fired!', void 0, true);
        }
    },
    {
        type: 'autoModerationRuleCreate',
        code: (ctx) => {
            ctx.client.debug('AutoModerationRuleCreate event fired!', void 0, true);
        }
    },
    {
        type: 'autoModerationRuleDelete',
        code: (ctx) => {
            ctx.client.debug('AutoModerationRuleDelete event fired!', void 0, true);
        }
    },
    {
        type: 'autoModerationRuleUpdate',
        code: (ctx) => {
            ctx.client.debug('AutoModerationRuleUpdate event fired!', void 0, true);
        }
    }
];
