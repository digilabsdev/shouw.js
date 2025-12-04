"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleDisplay = void 0;
const chalk_1 = __importDefault(require("chalk"));
class ConsoleDisplay {
    readyInfo;
    commandStatusTable;
    frameColor;
    constructor() {
        this.commandStatusTable = [];
        this.readyInfo = [];
        this.frameColor = chalk_1.default.white;
    }
    static displayConsole(title, theme, lines) {
        const display = new ConsoleDisplay();
        display.setTheme(theme);
        for (const line of lines) {
            display.info(line);
        }
        display.printInfo(title);
    }
    static commandList(theme, commands) {
        const display = new ConsoleDisplay();
        display.setTheme(theme);
        for (const command of commands) {
            display.command(command.name, command.command, command.loaded, command.error);
        }
        display.printCommandStatus();
    }
    command(name, command, loaded = true, error) {
        this.commandStatusTable.push([
            error
                ? chalk_1.default.red(error.message)
                : loaded
                    ? `${chalk_1.default.green('Loaded')} ${command ? command : ''}`
                    : `${chalk_1.default.red('Failed to load')} ${command ? command : ''}`,
            name
        ]);
    }
    info(line) {
        this.readyInfo.push(line);
    }
    setTheme(color) {
        this.frameColor = chalk_1.default[color] ?? chalk_1.default.white;
    }
    stripAnsi(str) {
        return str?.replace(/\x1B\[[0-9;]*m/g, '');
    }
    padCell(str, width) {
        const len = this.stripAnsi(str).length;
        return str + ' '.repeat(width - len);
    }
    getColumnWidths(rows) {
        const colCount = rows[0].length;
        const widths = Array(colCount).fill(0);
        for (const row of rows) {
            row.forEach((cell, i) => {
                const len = this.stripAnsi(cell).length;
                if (len > widths[i])
                    widths[i] = len;
            });
        }
        return widths.map((w) => w + 2);
    }
    drawTable(headers, dataRows) {
        const allRows = [headers, ...dataRows];
        const colWidths = this.getColumnWidths(allRows);
        const chars = {
            topLeft: '╭',
            topRight: '╮',
            bottomLeft: '╰',
            bottomRight: '╯',
            horizontal: '─',
            vertical: '│',
            midTop: '┬',
            midBottom: '┴',
            midLeft: '├',
            midRight: '┤',
            center: '┼'
        };
        const makeLine = (left, mid, right) => this.frameColor(left + colWidths.map((w) => chars.horizontal.repeat(w)).join(mid) + right);
        const formatRow = (row) => this.frameColor(chars.vertical) +
            row.map((cell, i) => this.padCell(` ${cell}`, colWidths[i])).join(this.frameColor(chars.vertical)) +
            this.frameColor(chars.vertical);
        console.log(makeLine(chars.topLeft, chars.midTop, chars.topRight));
        console.log(formatRow(headers));
        console.log(makeLine(chars.midLeft, chars.center, chars.midRight));
        for (const row of dataRows) {
            console.log(formatRow(row));
        }
        console.log(makeLine(chars.bottomLeft, chars.midBottom, chars.bottomRight));
    }
    drawBlock(title, lines) {
        const maxLength = Math.max(this.stripAnsi(title).length, ...lines.map((l) => this.stripAnsi(l.text).length));
        const width = maxLength + 4;
        const top = this.frameColor(`╭${'─'.repeat(width)}╮`);
        const bottom = this.frameColor(`╰${'─'.repeat(width)}╯`);
        const centerText = (text) => {
            const len = this.stripAnsi(text).length;
            const totalPadding = width - len;
            const leftPadding = Math.floor(totalPadding / 2);
            const rightPadding = totalPadding - leftPadding;
            return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
        };
        console.log(top);
        console.log(this.frameColor('│') + centerText(title) + this.frameColor('│'));
        for (const line of lines) {
            const text = typeof line === 'object' && line.text ? line.text : line;
            const colored = typeof line === 'object' && chalk_1.default[line.color] ? chalk_1.default[line.color](text) : text;
            console.log(this.frameColor('│') + centerText(colored) + this.frameColor('│'));
        }
        console.log(bottom);
    }
    printInfo(title) {
        if (this.readyInfo.length)
            this.drawBlock(title, this.readyInfo);
    }
    printCommandStatus() {
        if (this.commandStatusTable.length)
            this.drawTable(['Status', 'Command Information'], this.commandStatusTable);
    }
}
exports.ConsoleDisplay = ConsoleDisplay;
