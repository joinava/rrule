"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iter = iter;
const datetime_js_1 = require("../datetime.js");
const dateutil_js_1 = require("../dateutil.js");
const datewithzone_js_1 = require("../datewithzone.js");
const helpers_js_1 = require("../helpers.js");
const index_js_1 = __importDefault(require("../iterinfo/index.js"));
const parseoptions_js_1 = require("../parseoptions.js");
const rrule_js_1 = require("../rrule.js");
const types_js_1 = require("../types.js");
const poslist_js_1 = require("./poslist.js");
function iter(iterResult, options) {
    const { dtstart, freq, interval, until, bysetpos } = options;
    let count = options.count;
    if (count === 0 || interval === 0) {
        return emitResult(iterResult);
    }
    const counterDate = datetime_js_1.DateTime.fromDate(dtstart);
    const ii = new index_js_1.default(options);
    ii.rebuild(counterDate.year, counterDate.month);
    let timeset = makeTimeset(ii, counterDate, options);
    for (;;) {
        const [dayset, start, end] = ii.getdayset(freq)(counterDate.year, counterDate.month, counterDate.day);
        const filtered = removeFilteredDays(dayset, start, end, ii, options);
        if ((0, helpers_js_1.notEmpty)(bysetpos)) {
            const poslist = (0, poslist_js_1.buildPoslist)(bysetpos, timeset, start, end, ii, dayset);
            for (let j = 0; j < poslist.length; j++) {
                const res = poslist[j];
                if (until && res > until) {
                    return emitResult(iterResult);
                }
                if (res >= dtstart) {
                    const rezonedDate = rezoneIfNeeded(res, options);
                    if (!iterResult.accept(rezonedDate)) {
                        return emitResult(iterResult);
                    }
                    if (count) {
                        --count;
                        if (!count) {
                            return emitResult(iterResult);
                        }
                    }
                }
            }
        }
        else {
            for (let j = start; j < end; j++) {
                const currentDay = dayset[j];
                if (!(0, helpers_js_1.isPresent)(currentDay)) {
                    continue;
                }
                const date = (0, dateutil_js_1.fromOrdinal)(ii.yearordinal + currentDay);
                for (let k = 0; k < timeset.length; k++) {
                    const time = timeset[k];
                    const res = (0, dateutil_js_1.combine)(date, time);
                    if (until && res > until) {
                        return emitResult(iterResult);
                    }
                    if (res >= dtstart) {
                        const rezonedDate = rezoneIfNeeded(res, options);
                        if (!iterResult.accept(rezonedDate)) {
                            return emitResult(iterResult);
                        }
                        if (count) {
                            --count;
                            if (!count) {
                                return emitResult(iterResult);
                            }
                        }
                    }
                }
            }
        }
        if (options.interval === 0) {
            return emitResult(iterResult);
        }
        // Handle frequency and interval
        counterDate.add(options, filtered);
        if (counterDate.year > dateutil_js_1.MAXYEAR) {
            return emitResult(iterResult);
        }
        if (!(0, types_js_1.freqIsDailyOrGreater)(freq)) {
            timeset = ii.gettimeset(freq)(counterDate.hour, counterDate.minute, counterDate.second, 0);
        }
        ii.rebuild(counterDate.year, counterDate.month);
    }
}
function isFiltered(ii, currentDay, options) {
    const { bymonth, byweekno, byweekday, byeaster, bymonthday, bynmonthday, byyearday, } = options;
    return (((0, helpers_js_1.notEmpty)(bymonth) && !(0, helpers_js_1.includes)(bymonth, ii.mmask[currentDay])) ||
        ((0, helpers_js_1.notEmpty)(byweekno) && !ii.wnomask[currentDay]) ||
        ((0, helpers_js_1.notEmpty)(byweekday) && !(0, helpers_js_1.includes)(byweekday, ii.wdaymask[currentDay])) ||
        ((0, helpers_js_1.notEmpty)(ii.nwdaymask) && !ii.nwdaymask[currentDay]) ||
        (byeaster !== null && !(0, helpers_js_1.includes)(ii.eastermask, currentDay)) ||
        (((0, helpers_js_1.notEmpty)(bymonthday) || (0, helpers_js_1.notEmpty)(bynmonthday)) &&
            !(0, helpers_js_1.includes)(bymonthday, ii.mdaymask[currentDay]) &&
            !(0, helpers_js_1.includes)(bynmonthday, ii.nmdaymask[currentDay])) ||
        ((0, helpers_js_1.notEmpty)(byyearday) &&
            ((currentDay < ii.yearlen &&
                !(0, helpers_js_1.includes)(byyearday, currentDay + 1) &&
                !(0, helpers_js_1.includes)(byyearday, -ii.yearlen + currentDay)) ||
                (currentDay >= ii.yearlen &&
                    !(0, helpers_js_1.includes)(byyearday, currentDay + 1 - ii.yearlen) &&
                    !(0, helpers_js_1.includes)(byyearday, -ii.nextyearlen + currentDay - ii.yearlen)))));
}
function rezoneIfNeeded(date, options) {
    return new datewithzone_js_1.DateWithZone(date, options.tzid).rezonedDate();
}
function emitResult(iterResult) {
    return iterResult.getValue();
}
function removeFilteredDays(dayset, start, end, ii, options) {
    let filtered = false;
    for (let dayCounter = start; dayCounter < end; dayCounter++) {
        const currentDay = dayset[dayCounter];
        filtered = isFiltered(ii, currentDay, options);
        if (filtered)
            dayset[currentDay] = null;
    }
    return filtered;
}
function makeTimeset(ii, counterDate, options) {
    const { freq, byhour, byminute, bysecond } = options;
    if ((0, types_js_1.freqIsDailyOrGreater)(freq)) {
        return (0, parseoptions_js_1.buildTimeset)(options);
    }
    if ((freq >= rrule_js_1.RRule.HOURLY &&
        (0, helpers_js_1.notEmpty)(byhour) &&
        !(0, helpers_js_1.includes)(byhour, counterDate.hour)) ||
        (freq >= rrule_js_1.RRule.MINUTELY &&
            (0, helpers_js_1.notEmpty)(byminute) &&
            !(0, helpers_js_1.includes)(byminute, counterDate.minute)) ||
        (freq >= rrule_js_1.RRule.SECONDLY &&
            (0, helpers_js_1.notEmpty)(bysecond) &&
            !(0, helpers_js_1.includes)(bysecond, counterDate.second))) {
        return [];
    }
    return ii.gettimeset(freq)(counterDate.hour, counterDate.minute, counterDate.second, counterDate.millisecond);
}
//# sourceMappingURL=index.js.map