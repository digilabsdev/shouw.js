"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShouwClient = void 0;
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
const chalk_1 = require("chalk");
const index_js_1 = require("../index.js");
const BaseClient_js_1 = require("./BaseClient.js");
class ShouwClient extends BaseClient_js_1.BaseClient {
    functions;
    commands;
    database;
    music;
    variablesManager;
    cacheManager;
    customEvents;
    prefix;
    shouwOptions;
    constructor(options) {
        super(options);
        options.shouwLogs = options.shouwLogs ?? true;
        options.respondToBots = options.respondToBots ?? false;
        options.guildOnly = options.guildOnly ?? false;
        options.suppressAllErrors = options.suppressAllErrors ?? false;
        options.debug = options.debug ?? false;
        this.shouwOptions = options;
        this.prefix = Array.isArray(options.prefix) ? options.prefix : [options.prefix];
        this.functions = new index_js_1.FunctionsManager(this);
        this.commands = new index_js_1.CommandsManager(this, options.events);
        this.variablesManager = new index_js_1.Variables(this);
        this.cacheManager = new index_js_1.CacheManager(this);
        this.customEvents = new index_js_1.CustomEvent(this);
        this.functions.load(path.join(__dirname, '../functions'), options.debug ?? false);
        this._disableFunctions(options.disableFunctions);
        this._loadExtensions(options.extensions);
    }
    command(...datas) {
        for (const data of datas) {
            if (typeof data !== 'object' ||
                !data ||
                !data.code ||
                (typeof data.code !== 'string' && typeof data.code !== 'function'))
                continue;
            if (data.type === 'interactionCreate') {
                if (!this.commands.interactionCreate)
                    continue;
                this.commands.interactionCreate[data.prototype ?? 'slash'].set(this.commands.interactionCreate[data.prototype ?? 'slash']?.size, data);
                continue;
            }
            const command = this.commands[data?.type ?? 'messageCreate'];
            if (!command)
                continue;
            command.set(command.size, data);
        }
        return this;
    }
    loadCommands(dir, logging = true) {
        const files = fs.readdirSync(dir);
        const loadedCommands = [];
        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                if (!fs.statSync(filePath).isDirectory()) {
                    if (file.endsWith('.js') ||
                        file.endsWith('.cjs') ||
                        file.endsWith('.json') ||
                        file.endsWith('.mjs')) {
                        let commands = require(path.join(process.cwd(), filePath));
                        commands = commands ? (commands?.default ?? commands) : [];
                        commands = Array.isArray(commands) ? commands : [commands];
                        if ((commands.length === 1 &&
                            typeof commands[0] === 'object' &&
                            Object.keys(commands[0]).length === 0) ||
                            commands.length === 0 ||
                            !commands) {
                            loadedCommands.push({
                                name: `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))}`,
                                loaded: false,
                                error: new Error('No exported command')
                            });
                            continue;
                        }
                        for (const command of commands) {
                            if (typeof command !== 'object' || !command || !command.code)
                                continue;
                            command.type = command.type ?? 'messageCreate';
                            if (!this.commands.isValidEventType(command.type)) {
                                loadedCommands.push({
                                    name: `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))} (${(0, chalk_1.cyan)(command.type ?? 'unknown')})`,
                                    command: `${command.name ?? command.channel}`,
                                    loaded: false,
                                    error: new Error('Invalid event type')
                                });
                                this.debug(`Skipping ${(0, chalk_1.red)(file)} because it's not a valid event type`, 'ERROR');
                                continue;
                            }
                            this.command({
                                ...command,
                                file: filePath
                            });
                            const debugName = `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))} (${(0, chalk_1.cyan)(command.type ?? 'unknown')})`;
                            loadedCommands.push({
                                name: debugName,
                                command: `${command.name ?? command.channel}`,
                                loaded: true
                            });
                            this.debug(`Loaded command ${(0, chalk_1.cyan)(command.name)} from ${(0, chalk_1.cyan)(file)}`, 'DEBUG');
                        }
                    }
                    else if (file.endsWith('.shouw') || file.endsWith('.shw') || file.endsWith('.sho')) {
                        const commands = index_js_1.Reader.run(filePath);
                        if (!Array.isArray(commands) || commands.length === 0) {
                            loadedCommands.push({
                                name: `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))}`,
                                loaded: false,
                                error: new Error('No exported command')
                            });
                            continue;
                        }
                        for (const command of commands) {
                            if (typeof command !== 'object' || !command || !command.code)
                                continue;
                            command.type = command.type ?? 'messageCreate';
                            if (!this.commands.isValidEventType(command.type)) {
                                loadedCommands.push({
                                    name: `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))} (${(0, chalk_1.cyan)(command.type ?? 'unknown')})`,
                                    command: `${command.name ?? command.channel}`,
                                    loaded: false,
                                    error: new Error('Invalid event type')
                                });
                                this.debug(`Skipping ${(0, chalk_1.red)(file)} because it's not a valid event type`, 'ERROR');
                                continue;
                            }
                            this.command({
                                ...command,
                                file: filePath
                            });
                            const debugName = `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))}  (${(0, chalk_1.cyan)(command.type ?? 'unknown')})`;
                            loadedCommands.push({
                                name: debugName,
                                command: `${command.name ?? command.channel}`,
                                loaded: true
                            });
                            this.debug(`Loaded command ${(0, chalk_1.cyan)(command.name)} from ${(0, chalk_1.cyan)(file)}`, 'DEBUG');
                        }
                    }
                    else {
                        const debugName = `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))}`;
                        loadedCommands.push({
                            name: debugName,
                            loaded: false,
                            error: new Error('Not a valid file type')
                        });
                        this.debug(`Skipping ${(0, chalk_1.red)(file)} because it's not a valid file type`, 'ERROR');
                    }
                }
            }
            catch (err) {
                const debugName = `${(0, chalk_1.gray)(filePath.split(path.sep).slice(-2).join(path.sep))}`;
                loadedCommands.push({ name: debugName, loaded: false, error: err });
                this.debug(`Error loading command ${(0, chalk_1.red)(file)}: ${err.stack}`, 'ERROR');
            }
        }
        if (this.shouwOptions.shouwLogs && logging)
            index_js_1.ConsoleDisplay.commandList('white', loadedCommands);
        return this;
    }
    variables(variables, table = this.database?.tables?.[0]) {
        if (!this.database)
            throw new Error('Database instance is not defined! Variables cannot be set without a database.');
        if (typeof variables !== 'object' || !variables)
            return this;
        for (const [key, value] of Object.entries(variables)) {
            this.variablesManager.set(key, value, table);
        }
        return this;
    }
    _loadExtensions(extensions) {
        if (!Array.isArray(extensions))
            return;
        for (const extension of extensions) {
            if (!extension || typeof extension?.initialize !== 'function')
                continue;
            extension.initialize(this);
            this.debug(`Loaded extension ${(0, chalk_1.cyan)(extension.name ?? 'unknown')}`, 'DEBUG');
        }
    }
    _disableFunctions(funcs) {
        if (!Array.isArray(funcs))
            return;
        for (const func of funcs) {
            if (!func)
                continue;
            const matched = this.functions.filter((f) => f.name.toLowerCase() === func.toLowerCase())[0];
            if (!matched)
                continue;
            this.functions.delete(matched.name);
            this.debug(`Disabled function ${(0, chalk_1.red)(matched.name)}`, 'DEBUG');
        }
    }
    debug(message, type = 'DEBUG', force = false) {
        if (message && (force === true || this.shouwOptions.debug === true)) {
            const color = type === 'ERROR' ? chalk_1.red : type === 'WARN' ? chalk_1.yellow : chalk_1.blue;
            console.log(`[${color(type)}] :: ${message}`);
        }
        return this;
    }
}
exports.ShouwClient = ShouwClient;
