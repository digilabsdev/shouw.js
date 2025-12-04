"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.wait = wait;
exports.filterObject = filterObject;
exports.filterArray = filterArray;
const promises_1 = require("node:timers/promises");
async function sleep(ms) {
    await (0, promises_1.setTimeout)(Number(ms));
}
async function wait(ms) {
    await (0, promises_1.setTimeout)(Number(ms));
}
function filterObject(object) {
    try {
        const result = {};
        const entries = Object.entries(object);
        if (!entries.length)
            return void 0;
        for (const [key, value] of entries) {
            if (value === void 0 || value === null || value === '')
                continue;
            if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    if (!value.length)
                        continue;
                    result[key] = filterArray(value);
                    continue;
                }
                const obj = filterObject(value);
                if (obj)
                    result[key] = obj;
                continue;
            }
            result[key] = value;
        }
        return result;
    }
    catch {
        return object;
    }
}
function filterArray(arr) {
    try {
        const result = [];
        if (!arr.length)
            return void 0;
        for (const item of arr) {
            if (item === void 0 || item === null || item === '')
                continue;
            if (typeof item === 'object') {
                if (Array.isArray(item)) {
                    result.push(...(filterArray(item) ?? []));
                    continue;
                }
                const obj = filterObject(item);
                if (obj)
                    result.push(obj);
                continue;
            }
            result.push(item);
        }
        return result;
    }
    catch {
        return arr;
    }
}
