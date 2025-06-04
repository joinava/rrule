"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTime = exports.Time = void 0;
const types_js_1 = require("./types.js");
const helpers_js_1 = require("./helpers.js");
const dateutil_js_1 = require("./dateutil.js");
class Time {
    hour;
    minute;
    second;
    millisecond;
    constructor(hour, minute, second, millisecond) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.millisecond = millisecond || 0;
    }
    getHours() {
        return this.hour;
    }
    getMinutes() {
        return this.minute;
    }
    getSeconds() {
        return this.second;
    }
    getMilliseconds() {
        return this.millisecond;
    }
    getTime() {
        return ((this.hour * 60 * 60 + this.minute * 60 + this.second) * 1000 +
            this.millisecond);
    }
}
exports.Time = Time;
class DateTime extends Time {
    day;
    month;
    year;
    static fromDate(date) {
        return new this(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.valueOf() % 1000);
    }
    constructor(year, month, day, hour, minute, second, millisecond) {
        super(hour, minute, second, millisecond);
        this.year = year;
        this.month = month;
        this.day = day;
    }
    getWeekday() {
        return (0, dateutil_js_1.getWeekday)(new Date(this.getTime()));
    }
    getTime() {
        return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond)).getTime();
    }
    getDay() {
        return this.day;
    }
    getMonth() {
        return this.month;
    }
    getYear() {
        return this.year;
    }
    addYears(years) {
        this.year += years;
    }
    addMonths(months) {
        this.month += months;
        if (this.month > 12) {
            const yearDiv = Math.floor(this.month / 12);
            const monthMod = (0, helpers_js_1.pymod)(this.month, 12);
            this.month = monthMod;
            this.year += yearDiv;
            if (this.month === 0) {
                this.month = 12;
                --this.year;
            }
        }
    }
    addWeekly(days, wkst) {
        if (wkst > this.getWeekday()) {
            this.day += -(this.getWeekday() + 1 + (6 - wkst)) + days * 7;
        }
        else {
            this.day += -(this.getWeekday() - wkst) + days * 7;
        }
        this.fixDay();
    }
    addDaily(days) {
        this.day += days;
        this.fixDay();
    }
    addHours(hours, filtered, byhour) {
        if (filtered) {
            // Jump to one iteration before next day
            this.hour += Math.floor((23 - this.hour) / hours) * hours;
        }
        for (;;) {
            this.hour += hours;
            const { div: dayDiv, mod: hourMod } = (0, helpers_js_1.divmod)(this.hour, 24);
            if (dayDiv) {
                this.hour = hourMod;
                this.addDaily(dayDiv);
            }
            if ((0, helpers_js_1.empty)(byhour) || (0, helpers_js_1.includes)(byhour, this.hour))
                break;
        }
    }
    addMinutes(minutes, filtered, byhour, byminute) {
        if (filtered) {
            // Jump to one iteration before next day
            this.minute +=
                Math.floor((1439 - (this.hour * 60 + this.minute)) / minutes) * minutes;
        }
        for (;;) {
            this.minute += minutes;
            const { div: hourDiv, mod: minuteMod } = (0, helpers_js_1.divmod)(this.minute, 60);
            if (hourDiv) {
                this.minute = minuteMod;
                this.addHours(hourDiv, false, byhour);
            }
            if (((0, helpers_js_1.empty)(byhour) || (0, helpers_js_1.includes)(byhour, this.hour)) &&
                ((0, helpers_js_1.empty)(byminute) || (0, helpers_js_1.includes)(byminute, this.minute))) {
                break;
            }
        }
    }
    addSeconds(seconds, filtered, byhour, byminute, bysecond) {
        if (filtered) {
            // Jump to one iteration before next day
            this.second +=
                Math.floor((86399 - (this.hour * 3600 + this.minute * 60 + this.second)) /
                    seconds) * seconds;
        }
        for (;;) {
            this.second += seconds;
            const { div: minuteDiv, mod: secondMod } = (0, helpers_js_1.divmod)(this.second, 60);
            if (minuteDiv) {
                this.second = secondMod;
                this.addMinutes(minuteDiv, false, byhour, byminute);
            }
            if (((0, helpers_js_1.empty)(byhour) || (0, helpers_js_1.includes)(byhour, this.hour)) &&
                ((0, helpers_js_1.empty)(byminute) || (0, helpers_js_1.includes)(byminute, this.minute)) &&
                ((0, helpers_js_1.empty)(bysecond) || (0, helpers_js_1.includes)(bysecond, this.second))) {
                break;
            }
        }
    }
    fixDay() {
        if (this.day <= 28) {
            return;
        }
        let daysinmonth = (0, dateutil_js_1.monthRange)(this.year, this.month - 1)[1];
        if (this.day <= daysinmonth) {
            return;
        }
        while (this.day > daysinmonth) {
            this.day -= daysinmonth;
            ++this.month;
            if (this.month === 13) {
                this.month = 1;
                ++this.year;
                if (this.year > dateutil_js_1.MAXYEAR) {
                    return;
                }
            }
            daysinmonth = (0, dateutil_js_1.monthRange)(this.year, this.month - 1)[1];
        }
    }
    add(options, filtered) {
        const { freq, interval, wkst, byhour, byminute, bysecond } = options;
        switch (freq) {
            case types_js_1.Frequency.YEARLY:
                return this.addYears(interval);
            case types_js_1.Frequency.MONTHLY:
                return this.addMonths(interval);
            case types_js_1.Frequency.WEEKLY:
                return this.addWeekly(interval, wkst);
            case types_js_1.Frequency.DAILY:
                return this.addDaily(interval);
            case types_js_1.Frequency.HOURLY:
                return this.addHours(interval, filtered, byhour);
            case types_js_1.Frequency.MINUTELY:
                return this.addMinutes(interval, filtered, byhour, byminute);
            case types_js_1.Frequency.SECONDLY:
                return this.addSeconds(interval, filtered, byhour, byminute, bysecond);
        }
    }
}
exports.DateTime = DateTime;
//# sourceMappingURL=datetime.js.map