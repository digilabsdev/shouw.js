"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardingManager = void 0;
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
class ShardingManager extends discord_js_1.ShardingManager {
    options;
    constructor(options) {
        if (!options.token || typeof options.token !== 'string')
            throw new Error('Invalid bot token! Please provide a valid discord bot token!');
        if (!options.file || typeof options.file !== 'string')
            throw new Error('Invalid file path! Please provide a valid file path where the bot is located!');
        options.totalShards = options.totalShards ?? 'auto';
        options.shardList = options.shardList ?? 'auto';
        options.mode = options.mode ?? 'process';
        options.respawn = options.respawn ?? true;
        options.silent = options.silent ?? false;
        options.shardArgs = options.shardArgs ?? [];
        options.execArgv = options.execArgv ?? [];
        options.spawnOptions = options.spawnOptions ?? {};
        options.spawnOptions.amount = options.totalShards ?? 'auto';
        options.spawnOptions.delay = options.spawnOptions.delay ?? 5500;
        options.spawnOptions.timeout = options.spawnOptions.timeout ?? 30_000;
        super(options.file, options);
        this.options = options;
        this.options = options;
    }
    async spawn(options) {
        return super.spawn(options ?? this.options.spawnOptions);
    }
    onShardCreate(eventFunction) {
        super.on('shardCreate', async (shard) => await eventFunction(shard, chalk_1.default));
        return this;
    }
}
exports.ShardingManager = ShardingManager;
