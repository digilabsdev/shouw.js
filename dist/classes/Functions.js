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
exports.FunctionsManager = void 0;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const chalk_1 = require("chalk");
const index_js_1 = require("../index.js");
const Collective_js_1 = require("../utils/Collective.js");
class FunctionsManager extends Collective_js_1.Collective {
    client;
    constructor(client) {
        super();
        this.client = client;
    }
    async load(basePath, debug) {
        const files = fs.readdirSync(basePath);
        for (const file of files) {
            const filePath = path.join(basePath, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                this.load(filePath, debug);
            }
            else if (file.endsWith('.js')) {
                try {
                    let RawFunction = require(filePath);
                    RawFunction = RawFunction ? (RawFunction?.default ?? RawFunction) : void 0;
                    if (!RawFunction) {
                        this.client.debug(`Function ${(0, chalk_1.cyan)(file)} has no default export`, 'WARN');
                        continue;
                    }
                    const func = new RawFunction();
                    this.create(func.name, func);
                    this.client.debug(`Function loaded: ${(0, chalk_1.cyan)(func.name)}`);
                }
                catch (err) {
                    this.client.debug(`Error in function ${(0, chalk_1.cyan)(file)}:\n${err.stack}`, 'ERROR');
                }
            }
        }
    }
    createFunction(...datas) {
        for (const data of datas) {
            if (!data.name || !data.code || !Array.isArray(data.params)) {
                this.client.debug('Failed to creating function: Missing required function data', 'ERROR');
                continue;
            }
            data.name = data.name.startsWith('$') ? data.name : `$${data.name}`;
            if (this.has(data.name))
                this.delete(data.name);
            data.type = !['shouw.js', 'discord.js', 'djs'].includes(data.type) ? 'shouw.js' : data.type;
            const func = new index_js_1.CustomFunction(data);
            this.create(func.name, func);
            this.client.debug(`Function created: ${(0, chalk_1.cyan)(func.name)}`);
        }
        return this;
    }
}
exports.FunctionsManager = FunctionsManager;
