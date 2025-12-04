"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variables = void 0;
const index_js_1 = require("../index.js");
class Variables {
    client;
    #cache;
    database;
    tables;
    constructor(client) {
        this.client = client;
        this.#cache = new index_js_1.Collective();
        this.database = client.database ?? void 0;
        this.tables = Array.isArray(this.database?.tables) ? this.database?.tables : [];
    }
    get cache() {
        return this.#cache;
    }
    set(name, value, table = this.tables[0]) {
        if (!name || !value || !table)
            return this;
        this.cache.set(`${table}_${name}`, {
            name,
            value,
            table
        });
        return this;
    }
    get(name, table = this.tables[0]) {
        return this.cache.get(`${table}_${name}`);
    }
    delete(name, table = this.tables[0]) {
        this.cache.delete(`${table}_${name}`);
        return this;
    }
    clear() {
        this.cache.clear();
        return this;
    }
    has(name, table = this.tables[0]) {
        return this.cache.has(`${table}_${name}`);
    }
    get size() {
        return this.cache.size;
    }
    get keys() {
        return this.cache.K;
    }
    get values() {
        return this.cache.V;
    }
}
exports.Variables = Variables;
