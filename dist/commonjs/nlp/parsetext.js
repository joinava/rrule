"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parseText;
const rrule_js_1 = require("../rrule.js");
const i18n_js_1 = __importDefault(require("./i18n.js"));
// =============================================================================
// Parser
// =============================================================================
class Parser {
    rules;
    text;
    symbol;
    value;
    done = true;
    constructor(rules) {
        this.rules = rules;
    }
    start(text) {
        this.text = text;
        this.done = false;
        return this.nextSymbol();
    }
    isDone() {
        return this.done && this.symbol === null;
    }
    nextSymbol() {
        let best;
        let bestSymbol;
        this.symbol = null;
        this.value = null;
        do {
            if (this.done)
                return false;
            let rule;
            best = null;
            for (const name in this.rules) {
                rule = this.rules[name];
                const match = rule.exec(this.text);
                if (match) {
                    if (best === null || match[0].length > best[0].length) {
                        best = match;
                        bestSymbol = name;
                    }
                }
            }
            if (best != null) {
                this.text = this.text.substr(best[0].length);
                if (this.text === '')
                    this.done = true;
            }
            if (best == null) {
                this.done = true;
                this.symbol = null;
                this.value = null;
                return;
            }
        } while (bestSymbol === 'SKIP');
        this.symbol = bestSymbol;
        this.value = best;
        return true;
    }
    accept(name) {
        if (this.symbol === name) {
            if (this.value) {
                const v = this.value;
                this.nextSymbol();
                return v;
            }
            this.nextSymbol();
            return true;
        }
        return false;
    }
    acceptNumber() {
        return this.accept('number');
    }
    expect(name) {
        if (this.accept(name))
            return true;
        throw new Error('expected ' + name + ' but found ' + this.symbol);
    }
}
function parseText(text, language = i18n_js_1.default) {
    const options = {};
    const ttr = new Parser(language.tokens);
    if (!ttr.start(text))
        return null;
    S();
    return options;
    function S() {
        // every [n]
        ttr.expect('every');
        const n = ttr.acceptNumber();
        if (n)
            options.interval = parseInt(n[0], 10);
        if (ttr.isDone())
            throw new Error('Unexpected end');
        switch (ttr.symbol) {
            case 'day(s)':
                options.freq = rrule_js_1.RRule.DAILY;
                if (ttr.nextSymbol()) {
                    AT();
                    F();
                }
                break;
            // FIXME Note: every 2 weekdays != every two weeks on weekdays.
            // DAILY on weekdays is not a valid rule
            case 'weekday(s)':
                options.freq = rrule_js_1.RRule.WEEKLY;
                options.byweekday = [rrule_js_1.RRule.MO, rrule_js_1.RRule.TU, rrule_js_1.RRule.WE, rrule_js_1.RRule.TH, rrule_js_1.RRule.FR];
                ttr.nextSymbol();
                AT();
                F();
                break;
            case 'week(s)':
                options.freq = rrule_js_1.RRule.WEEKLY;
                if (ttr.nextSymbol()) {
                    ON();
                    AT();
                    F();
                }
                break;
            case 'hour(s)':
                options.freq = rrule_js_1.RRule.HOURLY;
                if (ttr.nextSymbol()) {
                    ON();
                    F();
                }
                break;
            case 'minute(s)':
                options.freq = rrule_js_1.RRule.MINUTELY;
                if (ttr.nextSymbol()) {
                    ON();
                    F();
                }
                break;
            case 'month(s)':
                options.freq = rrule_js_1.RRule.MONTHLY;
                if (ttr.nextSymbol()) {
                    ON();
                    F();
                }
                break;
            case 'year(s)':
                options.freq = rrule_js_1.RRule.YEARLY;
                if (ttr.nextSymbol()) {
                    ON();
                    F();
                }
                break;
            case 'monday':
            case 'tuesday':
            case 'wednesday':
            case 'thursday':
            case 'friday':
            case 'saturday':
            case 'sunday':
                options.freq = rrule_js_1.RRule.WEEKLY;
                const key = ttr.symbol
                    .substr(0, 2)
                    .toUpperCase();
                options.byweekday = [rrule_js_1.RRule[key]];
                if (!ttr.nextSymbol())
                    return;
                // TODO check for duplicates
                while (ttr.accept('comma')) {
                    if (ttr.isDone())
                        throw new Error('Unexpected end');
                    const wkd = decodeWKD();
                    if (!wkd) {
                        throw new Error('Unexpected symbol ' + ttr.symbol + ', expected weekday');
                    }
                    options.byweekday.push(rrule_js_1.RRule[wkd]);
                    ttr.nextSymbol();
                }
                AT();
                MDAYs();
                F();
                break;
            case 'january':
            case 'february':
            case 'march':
            case 'april':
            case 'may':
            case 'june':
            case 'july':
            case 'august':
            case 'september':
            case 'october':
            case 'november':
            case 'december':
                options.freq = rrule_js_1.RRule.YEARLY;
                options.bymonth = [decodeM()];
                if (!ttr.nextSymbol())
                    return;
                // TODO check for duplicates
                while (ttr.accept('comma')) {
                    if (ttr.isDone())
                        throw new Error('Unexpected end');
                    const m = decodeM();
                    if (!m) {
                        throw new Error('Unexpected symbol ' + ttr.symbol + ', expected month');
                    }
                    options.bymonth.push(m);
                    ttr.nextSymbol();
                }
                ON();
                F();
                break;
            default:
                throw new Error('Unknown symbol');
        }
    }
    function ON() {
        const on = ttr.accept('on');
        const the = ttr.accept('the');
        if (!(on || the))
            return;
        do {
            const nth = decodeNTH();
            const wkd = decodeWKD();
            const m = decodeM();
            // nth <weekday> | <weekday>
            if (nth) {
                // ttr.nextSymbol()
                if (wkd) {
                    ttr.nextSymbol();
                    if (!options.byweekday)
                        options.byweekday = [];
                    options.byweekday.push(rrule_js_1.RRule[wkd].nth(nth));
                }
                else {
                    if (!options.bymonthday)
                        options.bymonthday = [];
                    options.bymonthday.push(nth);
                    ttr.accept('day(s)');
                }
                // <weekday>
            }
            else if (wkd) {
                ttr.nextSymbol();
                if (!options.byweekday)
                    options.byweekday = [];
                options.byweekday.push(rrule_js_1.RRule[wkd]);
            }
            else if (ttr.symbol === 'weekday(s)') {
                ttr.nextSymbol();
                if (!options.byweekday) {
                    options.byweekday = [rrule_js_1.RRule.MO, rrule_js_1.RRule.TU, rrule_js_1.RRule.WE, rrule_js_1.RRule.TH, rrule_js_1.RRule.FR];
                }
            }
            else if (ttr.symbol === 'week(s)') {
                ttr.nextSymbol();
                let n = ttr.acceptNumber();
                if (!n) {
                    throw new Error('Unexpected symbol ' + ttr.symbol + ', expected week number');
                }
                options.byweekno = [parseInt(n[0], 10)];
                while (ttr.accept('comma')) {
                    n = ttr.acceptNumber();
                    if (!n) {
                        throw new Error('Unexpected symbol ' + ttr.symbol + '; expected monthday');
                    }
                    options.byweekno.push(parseInt(n[0], 10));
                }
            }
            else if (m) {
                ttr.nextSymbol();
                if (!options.bymonth)
                    options.bymonth = [];
                options.bymonth.push(m);
            }
            else {
                return;
            }
        } while (ttr.accept('comma') || ttr.accept('the') || ttr.accept('on'));
    }
    function AT() {
        const at = ttr.accept('at');
        if (!at)
            return;
        do {
            let n = ttr.acceptNumber();
            if (!n) {
                throw new Error('Unexpected symbol ' + ttr.symbol + ', expected hour');
            }
            options.byhour = [parseInt(n[0], 10)];
            while (ttr.accept('comma')) {
                n = ttr.acceptNumber();
                if (!n) {
                    throw new Error('Unexpected symbol ' + ttr.symbol + '; expected hour');
                }
                options.byhour.push(parseInt(n[0], 10));
            }
        } while (ttr.accept('comma') || ttr.accept('at'));
    }
    function decodeM() {
        switch (ttr.symbol) {
            case 'january':
                return 1;
            case 'february':
                return 2;
            case 'march':
                return 3;
            case 'april':
                return 4;
            case 'may':
                return 5;
            case 'june':
                return 6;
            case 'july':
                return 7;
            case 'august':
                return 8;
            case 'september':
                return 9;
            case 'october':
                return 10;
            case 'november':
                return 11;
            case 'december':
                return 12;
            default:
                return false;
        }
    }
    function decodeWKD() {
        switch (ttr.symbol) {
            case 'monday':
            case 'tuesday':
            case 'wednesday':
            case 'thursday':
            case 'friday':
            case 'saturday':
            case 'sunday':
                return ttr.symbol.substr(0, 2).toUpperCase();
            default:
                return false;
        }
    }
    function decodeNTH() {
        switch (ttr.symbol) {
            case 'last':
                ttr.nextSymbol();
                return -1;
            case 'first':
                ttr.nextSymbol();
                return 1;
            case 'second':
                ttr.nextSymbol();
                return ttr.accept('last') ? -2 : 2;
            case 'third':
                ttr.nextSymbol();
                return ttr.accept('last') ? -3 : 3;
            case 'nth':
                const v = parseInt(ttr.value[1], 10);
                if (v < -366 || v > 366)
                    throw new Error('Nth out of range: ' + v);
                ttr.nextSymbol();
                return ttr.accept('last') ? -v : v;
            default:
                return false;
        }
    }
    function MDAYs() {
        ttr.accept('on');
        ttr.accept('the');
        let nth = decodeNTH();
        if (!nth)
            return;
        options.bymonthday = [nth];
        ttr.nextSymbol();
        while (ttr.accept('comma')) {
            nth = decodeNTH();
            if (!nth) {
                throw new Error('Unexpected symbol ' + ttr.symbol + '; expected monthday');
            }
            options.bymonthday.push(nth);
            ttr.nextSymbol();
        }
    }
    function F() {
        if (ttr.symbol === 'until') {
            const date = Date.parse(ttr.text);
            if (!date)
                throw new Error('Cannot parse until date:' + ttr.text);
            options.until = new Date(date);
        }
        else if (ttr.accept('for')) {
            options.count = parseInt(ttr.value[0], 10);
            ttr.expect('number');
            // ttr.expect('times')
        }
    }
}
//# sourceMappingURL=parsetext.js.map