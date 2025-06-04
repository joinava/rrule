"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeOptions = initializeOptions;
exports.parseOptions = parseOptions;
exports.buildTimeset = buildTimeset;
const types_js_1 = require("./types.js");
const helpers_js_1 = require("./helpers.js");
const rrule_js_1 = require("./rrule.js");
const dateutil_js_1 = require("./dateutil.js");
const weekday_js_1 = require("./weekday.js");
const datetime_js_1 = require("./datetime.js");
function initializeOptions(options) {
    const invalid = [];
    const keys = Object.keys(options);
    // Shallow copy for options and origOptions and check for invalid
    for (const key of keys) {
        if (!(0, helpers_js_1.includes)(rrule_js_1.defaultKeys, key))
            invalid.push(key);
        if ((0, dateutil_js_1.isDate)(options[key]) && !(0, dateutil_js_1.isValidDate)(options[key])) {
            invalid.push(key);
        }
    }
    if (invalid.length) {
        throw new Error('Invalid options: ' + invalid.join(', '));
    }
    return { ...options };
}
function parseOptions(options) {
    const opts = { ...rrule_js_1.DEFAULT_OPTIONS, ...initializeOptions(options) };
    if ((0, helpers_js_1.isPresent)(opts.byeaster))
        opts.freq = rrule_js_1.RRule.YEARLY;
    if (!((0, helpers_js_1.isPresent)(opts.freq) && rrule_js_1.RRule.FREQUENCIES[opts.freq])) {
        throw new Error(`Invalid frequency: ${opts.freq} ${options.freq}`);
    }
    if (!opts.dtstart)
        opts.dtstart = new Date(new Date().setMilliseconds(0));
    if (!(0, helpers_js_1.isPresent)(opts.wkst)) {
        opts.wkst = rrule_js_1.RRule.MO.weekday;
    }
    else if ((0, helpers_js_1.isNumber)(opts.wkst)) {
        // cool, just keep it like that
    }
    else {
        opts.wkst = opts.wkst.weekday;
    }
    if ((0, helpers_js_1.isPresent)(opts.bysetpos)) {
        if ((0, helpers_js_1.isNumber)(opts.bysetpos))
            opts.bysetpos = [opts.bysetpos];
        for (let i = 0; i < opts.bysetpos.length; i++) {
            const v = opts.bysetpos[i];
            if (v === 0 || !(v >= -366 && v <= 366)) {
                throw new Error('bysetpos must be between 1 and 366,' + ' or between -366 and -1');
            }
        }
    }
    if (!(Boolean(opts.byweekno) ||
        (0, helpers_js_1.notEmpty)(opts.byweekno) ||
        (0, helpers_js_1.notEmpty)(opts.byyearday) ||
        Boolean(opts.bymonthday) ||
        (0, helpers_js_1.notEmpty)(opts.bymonthday) ||
        (0, helpers_js_1.isPresent)(opts.byweekday) ||
        (0, helpers_js_1.isPresent)(opts.byeaster))) {
        switch (opts.freq) {
            case rrule_js_1.RRule.YEARLY:
                if (!opts.bymonth)
                    opts.bymonth = opts.dtstart.getUTCMonth() + 1;
                opts.bymonthday = opts.dtstart.getUTCDate();
                break;
            case rrule_js_1.RRule.MONTHLY:
                opts.bymonthday = opts.dtstart.getUTCDate();
                break;
            case rrule_js_1.RRule.WEEKLY:
                opts.byweekday = [(0, dateutil_js_1.getWeekday)(opts.dtstart)];
                break;
        }
    }
    // bymonth
    if ((0, helpers_js_1.isPresent)(opts.bymonth) && !(0, helpers_js_1.isArray)(opts.bymonth)) {
        opts.bymonth = [opts.bymonth];
    }
    // byyearday
    if ((0, helpers_js_1.isPresent)(opts.byyearday) &&
        !(0, helpers_js_1.isArray)(opts.byyearday) &&
        (0, helpers_js_1.isNumber)(opts.byyearday)) {
        opts.byyearday = [opts.byyearday];
    }
    // bymonthday
    if (!(0, helpers_js_1.isPresent)(opts.bymonthday)) {
        opts.bymonthday = [];
        opts.bynmonthday = [];
    }
    else if ((0, helpers_js_1.isArray)(opts.bymonthday)) {
        const bymonthday = [];
        const bynmonthday = [];
        for (let i = 0; i < opts.bymonthday.length; i++) {
            const v = opts.bymonthday[i];
            if (v > 0) {
                bymonthday.push(v);
            }
            else if (v < 0) {
                bynmonthday.push(v);
            }
        }
        opts.bymonthday = bymonthday;
        opts.bynmonthday = bynmonthday;
    }
    else if (opts.bymonthday < 0) {
        opts.bynmonthday = [opts.bymonthday];
        opts.bymonthday = [];
    }
    else {
        opts.bynmonthday = [];
        opts.bymonthday = [opts.bymonthday];
    }
    // byweekno
    if ((0, helpers_js_1.isPresent)(opts.byweekno) && !(0, helpers_js_1.isArray)(opts.byweekno)) {
        opts.byweekno = [opts.byweekno];
    }
    // byweekday / bynweekday
    if (!(0, helpers_js_1.isPresent)(opts.byweekday)) {
        opts.bynweekday = null;
    }
    else if ((0, helpers_js_1.isNumber)(opts.byweekday)) {
        opts.byweekday = [opts.byweekday];
        opts.bynweekday = null;
    }
    else if ((0, helpers_js_1.isWeekdayStr)(opts.byweekday)) {
        opts.byweekday = [weekday_js_1.Weekday.fromStr(opts.byweekday).weekday];
        opts.bynweekday = null;
    }
    else if (opts.byweekday instanceof weekday_js_1.Weekday) {
        if (!opts.byweekday.n || opts.freq > rrule_js_1.RRule.MONTHLY) {
            opts.byweekday = [opts.byweekday.weekday];
            opts.bynweekday = null;
        }
        else {
            opts.bynweekday = [[opts.byweekday.weekday, opts.byweekday.n]];
            opts.byweekday = null;
        }
    }
    else {
        const byweekday = [];
        const bynweekday = [];
        for (let i = 0; i < opts.byweekday.length; i++) {
            const wday = opts.byweekday[i];
            if ((0, helpers_js_1.isNumber)(wday)) {
                byweekday.push(wday);
                continue;
            }
            else if ((0, helpers_js_1.isWeekdayStr)(wday)) {
                byweekday.push(weekday_js_1.Weekday.fromStr(wday).weekday);
                continue;
            }
            if (!wday.n || opts.freq > rrule_js_1.RRule.MONTHLY) {
                byweekday.push(wday.weekday);
            }
            else {
                bynweekday.push([wday.weekday, wday.n]);
            }
        }
        opts.byweekday = (0, helpers_js_1.notEmpty)(byweekday) ? byweekday : null;
        opts.bynweekday = (0, helpers_js_1.notEmpty)(bynweekday) ? bynweekday : null;
    }
    // byhour
    if (!(0, helpers_js_1.isPresent)(opts.byhour)) {
        opts.byhour = opts.freq < rrule_js_1.RRule.HOURLY ? [opts.dtstart.getUTCHours()] : null;
    }
    else if ((0, helpers_js_1.isNumber)(opts.byhour)) {
        opts.byhour = [opts.byhour];
    }
    // byminute
    if (!(0, helpers_js_1.isPresent)(opts.byminute)) {
        opts.byminute =
            opts.freq < rrule_js_1.RRule.MINUTELY ? [opts.dtstart.getUTCMinutes()] : null;
    }
    else if ((0, helpers_js_1.isNumber)(opts.byminute)) {
        opts.byminute = [opts.byminute];
    }
    // bysecond
    if (!(0, helpers_js_1.isPresent)(opts.bysecond)) {
        opts.bysecond =
            opts.freq < rrule_js_1.RRule.SECONDLY ? [opts.dtstart.getUTCSeconds()] : null;
    }
    else if ((0, helpers_js_1.isNumber)(opts.bysecond)) {
        opts.bysecond = [opts.bysecond];
    }
    return { parsedOptions: opts };
}
function buildTimeset(opts) {
    const millisecondModulo = opts.dtstart.getTime() % 1000;
    if (!(0, types_js_1.freqIsDailyOrGreater)(opts.freq)) {
        return [];
    }
    const timeset = [];
    opts.byhour.forEach((hour) => {
        opts.byminute.forEach((minute) => {
            opts.bysecond.forEach((second) => {
                timeset.push(new datetime_js_1.Time(hour, minute, second, millisecondModulo));
            });
        });
    });
    return timeset;
}
//# sourceMappingURL=parseoptions.js.map