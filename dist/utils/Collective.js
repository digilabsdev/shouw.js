"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collective = void 0;
class Collective extends Map {
    create(key, value) {
        super.set(key, value);
        return this;
    }
    filter(fn) {
        return Array.from(this.V).filter(fn);
    }
    filterKeys(fn) {
        return Array.from(this.K).filter(fn);
    }
    find(fn) {
        return Array.from(this.V).find(fn);
    }
    findKey(fn) {
        return Array.from(this.K).find(fn);
    }
    some(fn) {
        return Array.from(this.V).some(fn);
    }
    someKeys(fn) {
        return Array.from(this.K).some(fn);
    }
    every(fn) {
        return Array.from(this.V).every(fn);
    }
    everyKeys(fn) {
        return Array.from(this.K).every(fn);
    }
    has(key) {
        return super.has(key);
    }
    get K() {
        return [...this.keys()];
    }
    get V() {
        return [...this.values()];
    }
}
exports.Collective = Collective;
