"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
class Time {
    static units = [
        { name: 'year', short: 'y', ms: 31536000000 },
        { name: 'month', short: 'mon', ms: 2628002880 },
        { name: 'week', short: 'w', ms: 604800000 },
        { name: 'day', short: 'd', ms: 86400000 },
        { name: 'hour', short: 'h', ms: 3600000 },
        { name: 'minute', short: 'm', ms: 60000 },
        { name: 'second', short: 's', ms: 1000 },
        { name: 'millisecond', short: 'ms', ms: 1 }
    ];
    static format(_time, useLongName = false) {
        let time = _time;
        const result = [];
        for (const { name, short, ms } of Time.units) {
            const count = Math.trunc(time / ms);
            if (count > 0) {
                result.push(`${count}${useLongName ? name : short}`);
                time -= count * ms;
            }
        }
        return result.join(useLongName ? ', ' : ' ');
    }
    static parse(time) {
        if (typeof time !== 'string' && typeof time !== 'number') {
            throw new TypeError('Time must be a string or number');
        }
        if (typeof time === 'number') {
            return {
                ms: time,
                format: Time.format(time)
            };
        }
        let totalMs = 0;
        const result = [];
        for (const unit of Time.units) {
            const regex = new RegExp(`(\\d+)${unit.short}\\b`, 'gi');
            const matches = [...time.matchAll(regex)];
            for (const match of matches) {
                const value = Number(match[1]);
                totalMs += value * unit.ms;
                result.push(Time.pluralize(value, unit.name));
            }
        }
        return {
            ms: totalMs,
            format: result.join(', ')
        };
    }
    static parseDigital(time) {
        const digitalRegex = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
        const match = time.match(digitalRegex);
        if (!match)
            return { ms: 0, format: '0s' };
        const [_, hOrM1, mOrS2, s = '0', ms = '0'] = match;
        let hours = 0;
        let minutes = 0;
        let seconds = Number.parseInt(s, 10);
        const milliseconds = Number.parseInt(ms.padEnd(3, '0'), 10);
        if (s !== '0' || ms !== '0') {
            hours = Number.parseInt(hOrM1, 10);
            minutes = Number.parseInt(mOrS2, 10);
        }
        else {
            minutes = Number.parseInt(hOrM1, 10);
            seconds = Number.parseInt(mOrS2, 10);
        }
        const totalMs = hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
        return {
            ms: totalMs,
            format: Time.format(totalMs)
        };
    }
    static digital(time) {
        let seconds = Math.trunc(time / 1000);
        const hours = Math.trunc(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.trunc(seconds / 60);
        seconds %= 60;
        return [hours, minutes, seconds].map((n) => n.toString().padStart(2, '0')).join(':');
    }
    static pluralize(num, unit, suffix = 's') {
        return `${num} ${unit}${num !== 1 ? suffix : ''}`;
    }
}
exports.Time = Time;
