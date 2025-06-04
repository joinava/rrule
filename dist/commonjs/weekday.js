"use strict";
// =============================================================================
// Weekday
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weekday = exports.ALL_WEEKDAYS = void 0;
exports.ALL_WEEKDAYS = [
    'MO',
    'TU',
    'WE',
    'TH',
    'FR',
    'SA',
    'SU',
];
class Weekday {
    weekday;
    n;
    constructor(weekday, n) {
        if (n === 0)
            throw new Error("Can't create weekday with n == 0");
        this.weekday = weekday;
        this.n = n;
    }
    static fromStr(str) {
        return new Weekday(exports.ALL_WEEKDAYS.indexOf(str));
    }
    // __call__ - Cannot call the object directly, do it through
    // e.g. RRule.TH.nth(-1) instead,
    nth(n) {
        return this.n === n ? this : new Weekday(this.weekday, n);
    }
    // __eq__
    equals(other) {
        return this.weekday === other.weekday && this.n === other.n;
    }
    // __repr__
    toString() {
        let s = exports.ALL_WEEKDAYS[this.weekday];
        if (this.n)
            s = (this.n > 0 ? '+' : '') + String(this.n) + s;
        return s;
    }
    getJsWeekday() {
        return this.weekday === 6 ? 0 : this.weekday + 1;
    }
}
exports.Weekday = Weekday;
//# sourceMappingURL=weekday.js.map