import { DateTime } from '../datetime.js';
import { combine, fromOrdinal, MAXYEAR } from '../dateutil.js';
import { DateWithZone } from '../datewithzone.js';
import { includes, isPresent, notEmpty } from '../helpers.js';
import Iterinfo from '../iterinfo/index.js';
import { buildTimeset } from '../parseoptions.js';
import { RRule } from '../rrule.js';
import { freqIsDailyOrGreater, } from '../types.js';
import { buildPoslist } from './poslist.js';
export function iter(iterResult, options) {
    const { dtstart, freq, interval, until, bysetpos } = options;
    let count = options.count;
    if (count === 0 || interval === 0) {
        return emitResult(iterResult);
    }
    const counterDate = DateTime.fromDate(dtstart);
    const ii = new Iterinfo(options);
    ii.rebuild(counterDate.year, counterDate.month);
    let timeset = makeTimeset(ii, counterDate, options);
    for (;;) {
        const [dayset, start, end] = ii.getdayset(freq)(counterDate.year, counterDate.month, counterDate.day);
        const filtered = removeFilteredDays(dayset, start, end, ii, options);
        if (notEmpty(bysetpos)) {
            const poslist = buildPoslist(bysetpos, timeset, start, end, ii, dayset);
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
                if (!isPresent(currentDay)) {
                    continue;
                }
                const date = fromOrdinal(ii.yearordinal + currentDay);
                for (let k = 0; k < timeset.length; k++) {
                    const time = timeset[k];
                    const res = combine(date, time);
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
        if (counterDate.year > MAXYEAR) {
            return emitResult(iterResult);
        }
        if (!freqIsDailyOrGreater(freq)) {
            timeset = ii.gettimeset(freq)(counterDate.hour, counterDate.minute, counterDate.second, 0);
        }
        ii.rebuild(counterDate.year, counterDate.month);
    }
}
function isFiltered(ii, currentDay, options) {
    const { bymonth, byweekno, byweekday, byeaster, bymonthday, bynmonthday, byyearday, } = options;
    return ((notEmpty(bymonth) && !includes(bymonth, ii.mmask[currentDay])) ||
        (notEmpty(byweekno) && !ii.wnomask[currentDay]) ||
        (notEmpty(byweekday) && !includes(byweekday, ii.wdaymask[currentDay])) ||
        (notEmpty(ii.nwdaymask) && !ii.nwdaymask[currentDay]) ||
        (byeaster !== null && !includes(ii.eastermask, currentDay)) ||
        ((notEmpty(bymonthday) || notEmpty(bynmonthday)) &&
            !includes(bymonthday, ii.mdaymask[currentDay]) &&
            !includes(bynmonthday, ii.nmdaymask[currentDay])) ||
        (notEmpty(byyearday) &&
            ((currentDay < ii.yearlen &&
                !includes(byyearday, currentDay + 1) &&
                !includes(byyearday, -ii.yearlen + currentDay)) ||
                (currentDay >= ii.yearlen &&
                    !includes(byyearday, currentDay + 1 - ii.yearlen) &&
                    !includes(byyearday, -ii.nextyearlen + currentDay - ii.yearlen)))));
}
function rezoneIfNeeded(date, options) {
    return new DateWithZone(date, options.tzid).rezonedDate();
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
    if (freqIsDailyOrGreater(freq)) {
        return buildTimeset(options);
    }
    if ((freq >= RRule.HOURLY &&
        notEmpty(byhour) &&
        !includes(byhour, counterDate.hour)) ||
        (freq >= RRule.MINUTELY &&
            notEmpty(byminute) &&
            !includes(byminute, counterDate.minute)) ||
        (freq >= RRule.SECONDLY &&
            notEmpty(bysecond) &&
            !includes(bysecond, counterDate.second))) {
        return [];
    }
    return ii.gettimeset(freq)(counterDate.hour, counterDate.minute, counterDate.second, counterDate.millisecond);
}
//# sourceMappingURL=index.js.map