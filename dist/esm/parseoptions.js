import { freqIsDailyOrGreater } from './types.js';
import { includes, notEmpty, isPresent, isNumber, isArray, isWeekdayStr, } from './helpers.js';
import { RRule, defaultKeys, DEFAULT_OPTIONS } from './rrule.js';
import { getWeekday, isDate, isValidDate } from './dateutil.js';
import { Weekday } from './weekday.js';
import { Time } from './datetime.js';
export function initializeOptions(options) {
    const invalid = [];
    const keys = Object.keys(options);
    // Shallow copy for options and origOptions and check for invalid
    for (const key of keys) {
        if (!includes(defaultKeys, key))
            invalid.push(key);
        if (isDate(options[key]) && !isValidDate(options[key])) {
            invalid.push(key);
        }
    }
    if (invalid.length) {
        throw new Error('Invalid options: ' + invalid.join(', '));
    }
    return { ...options };
}
export function parseOptions(options) {
    const opts = { ...DEFAULT_OPTIONS, ...initializeOptions(options) };
    if (isPresent(opts.byeaster))
        opts.freq = RRule.YEARLY;
    if (!(isPresent(opts.freq) && RRule.FREQUENCIES[opts.freq])) {
        throw new Error(`Invalid frequency: ${opts.freq} ${options.freq}`);
    }
    if (!opts.dtstart)
        opts.dtstart = new Date(new Date().setMilliseconds(0));
    if (!isPresent(opts.wkst)) {
        opts.wkst = RRule.MO.weekday;
    }
    else if (isNumber(opts.wkst)) {
        // cool, just keep it like that
    }
    else {
        opts.wkst = opts.wkst.weekday;
    }
    if (isPresent(opts.bysetpos)) {
        if (isNumber(opts.bysetpos))
            opts.bysetpos = [opts.bysetpos];
        for (let i = 0; i < opts.bysetpos.length; i++) {
            const v = opts.bysetpos[i];
            if (v === 0 || !(v >= -366 && v <= 366)) {
                throw new Error('bysetpos must be between 1 and 366,' + ' or between -366 and -1');
            }
        }
    }
    if (!(Boolean(opts.byweekno) ||
        notEmpty(opts.byweekno) ||
        notEmpty(opts.byyearday) ||
        Boolean(opts.bymonthday) ||
        notEmpty(opts.bymonthday) ||
        isPresent(opts.byweekday) ||
        isPresent(opts.byeaster))) {
        switch (opts.freq) {
            case RRule.YEARLY:
                if (!opts.bymonth)
                    opts.bymonth = opts.dtstart.getUTCMonth() + 1;
                opts.bymonthday = opts.dtstart.getUTCDate();
                break;
            case RRule.MONTHLY:
                opts.bymonthday = opts.dtstart.getUTCDate();
                break;
            case RRule.WEEKLY:
                opts.byweekday = [getWeekday(opts.dtstart)];
                break;
        }
    }
    // bymonth
    if (isPresent(opts.bymonth) && !isArray(opts.bymonth)) {
        opts.bymonth = [opts.bymonth];
    }
    // byyearday
    if (isPresent(opts.byyearday) &&
        !isArray(opts.byyearday) &&
        isNumber(opts.byyearday)) {
        opts.byyearday = [opts.byyearday];
    }
    // bymonthday
    if (!isPresent(opts.bymonthday)) {
        opts.bymonthday = [];
        opts.bynmonthday = [];
    }
    else if (isArray(opts.bymonthday)) {
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
    if (isPresent(opts.byweekno) && !isArray(opts.byweekno)) {
        opts.byweekno = [opts.byweekno];
    }
    // byweekday / bynweekday
    if (!isPresent(opts.byweekday)) {
        opts.bynweekday = null;
    }
    else if (isNumber(opts.byweekday)) {
        opts.byweekday = [opts.byweekday];
        opts.bynweekday = null;
    }
    else if (isWeekdayStr(opts.byweekday)) {
        opts.byweekday = [Weekday.fromStr(opts.byweekday).weekday];
        opts.bynweekday = null;
    }
    else if (opts.byweekday instanceof Weekday) {
        if (!opts.byweekday.n || opts.freq > RRule.MONTHLY) {
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
            if (isNumber(wday)) {
                byweekday.push(wday);
                continue;
            }
            else if (isWeekdayStr(wday)) {
                byweekday.push(Weekday.fromStr(wday).weekday);
                continue;
            }
            if (!wday.n || opts.freq > RRule.MONTHLY) {
                byweekday.push(wday.weekday);
            }
            else {
                bynweekday.push([wday.weekday, wday.n]);
            }
        }
        opts.byweekday = notEmpty(byweekday) ? byweekday : null;
        opts.bynweekday = notEmpty(bynweekday) ? bynweekday : null;
    }
    // byhour
    if (!isPresent(opts.byhour)) {
        opts.byhour = opts.freq < RRule.HOURLY ? [opts.dtstart.getUTCHours()] : null;
    }
    else if (isNumber(opts.byhour)) {
        opts.byhour = [opts.byhour];
    }
    // byminute
    if (!isPresent(opts.byminute)) {
        opts.byminute =
            opts.freq < RRule.MINUTELY ? [opts.dtstart.getUTCMinutes()] : null;
    }
    else if (isNumber(opts.byminute)) {
        opts.byminute = [opts.byminute];
    }
    // bysecond
    if (!isPresent(opts.bysecond)) {
        opts.bysecond =
            opts.freq < RRule.SECONDLY ? [opts.dtstart.getUTCSeconds()] : null;
    }
    else if (isNumber(opts.bysecond)) {
        opts.bysecond = [opts.bysecond];
    }
    return { parsedOptions: opts };
}
export function buildTimeset(opts) {
    const millisecondModulo = opts.dtstart.getTime() % 1000;
    if (!freqIsDailyOrGreater(opts.freq)) {
        return [];
    }
    const timeset = [];
    opts.byhour.forEach((hour) => {
        opts.byminute.forEach((minute) => {
            opts.bysecond.forEach((second) => {
                timeset.push(new Time(hour, minute, second, millisecondModulo));
            });
        });
    });
    return timeset;
}
//# sourceMappingURL=parseoptions.js.map