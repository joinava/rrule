import { datetime, getWeekday, isLeapYear, toOrdinal } from '../dateutil.js';
import { empty, includes, pymod, repeat } from '../helpers.js';
import { M365MASK, M365RANGE, M366MASK, M366RANGE, MDAY365MASK, MDAY366MASK, NMDAY365MASK, NMDAY366MASK, WDAYMASK, } from '../masks.js';
export function rebuildYear(year, options) {
    const firstyday = datetime(year, 1, 1);
    const yearlen = isLeapYear(year) ? 366 : 365;
    const nextyearlen = isLeapYear(year + 1) ? 366 : 365;
    const yearordinal = toOrdinal(firstyday);
    const yearweekday = getWeekday(firstyday);
    const result = {
        yearlen,
        nextyearlen,
        yearordinal,
        yearweekday,
        ...baseYearMasks(year),
        wnomask: null,
    };
    if (empty(options.byweekno)) {
        return result;
    }
    result.wnomask = repeat(0, yearlen + 7);
    let firstwkst;
    let wyearlen;
    let no1wkst = (firstwkst = pymod(7 - yearweekday + options.wkst, 7));
    if (no1wkst >= 4) {
        no1wkst = 0;
        // Number of days in the year, plus the days we got
        // from last year.
        wyearlen = result.yearlen + pymod(yearweekday - options.wkst, 7);
    }
    else {
        // Number of days in the year, minus the days we
        // left in last year.
        wyearlen = yearlen - no1wkst;
    }
    const div = Math.floor(wyearlen / 7);
    const mod = pymod(wyearlen, 7);
    const numweeks = Math.floor(div + mod / 4);
    for (let j = 0; j < options.byweekno.length; j++) {
        let n = options.byweekno[j];
        if (n < 0) {
            n += numweeks + 1;
        }
        if (!(n > 0 && n <= numweeks)) {
            continue;
        }
        let i;
        if (n > 1) {
            i = no1wkst + (n - 1) * 7;
            if (no1wkst !== firstwkst) {
                i -= 7 - firstwkst;
            }
        }
        else {
            i = no1wkst;
        }
        for (let k = 0; k < 7; k++) {
            result.wnomask[i] = 1;
            i++;
            if (result.wdaymask[i] === options.wkst)
                break;
        }
    }
    if (includes(options.byweekno, 1)) {
        // Check week number 1 of next year as well
        // orig-TODO : Check -numweeks for next year.
        let i = no1wkst + numweeks * 7;
        if (no1wkst !== firstwkst)
            i -= 7 - firstwkst;
        if (i < yearlen) {
            // If week starts in next year, we
            // don't care about it.
            for (let j = 0; j < 7; j++) {
                result.wnomask[i] = 1;
                i += 1;
                if (result.wdaymask[i] === options.wkst)
                    break;
            }
        }
    }
    if (no1wkst) {
        // Check last week number of last year as
        // well. If no1wkst is 0, either the year
        // started on week start, or week number 1
        // got days from last year, so there are no
        // days from last year's last week number in
        // this year.
        let lnumweeks;
        if (!includes(options.byweekno, -1)) {
            const lyearweekday = getWeekday(datetime(year - 1, 1, 1));
            let lno1wkst = pymod(7 - lyearweekday.valueOf() + options.wkst, 7);
            const lyearlen = isLeapYear(year - 1) ? 366 : 365;
            let weekst;
            if (lno1wkst >= 4) {
                lno1wkst = 0;
                weekst = lyearlen + pymod(lyearweekday - options.wkst, 7);
            }
            else {
                weekst = yearlen - no1wkst;
            }
            lnumweeks = Math.floor(52 + pymod(weekst, 7) / 4);
        }
        else {
            lnumweeks = -1;
        }
        if (includes(options.byweekno, lnumweeks)) {
            for (let i = 0; i < no1wkst; i++)
                result.wnomask[i] = 1;
        }
    }
    return result;
}
function baseYearMasks(year) {
    const yearlen = isLeapYear(year) ? 366 : 365;
    const firstyday = datetime(year, 1, 1);
    const wday = getWeekday(firstyday);
    if (yearlen === 365) {
        return {
            mmask: M365MASK,
            mdaymask: MDAY365MASK,
            nmdaymask: NMDAY365MASK,
            wdaymask: WDAYMASK.slice(wday),
            mrange: M365RANGE,
        };
    }
    return {
        mmask: M366MASK,
        mdaymask: MDAY366MASK,
        nmdaymask: NMDAY366MASK,
        wdaymask: WDAYMASK.slice(wday),
        mrange: M366RANGE,
    };
}
//# sourceMappingURL=yearinfo.js.map