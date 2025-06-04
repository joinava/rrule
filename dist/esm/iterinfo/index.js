import { Time } from '../datetime.js';
import { datetime, sort, toOrdinal } from '../dateutil.js';
import { isPresent, notEmpty, range, repeat } from '../helpers.js';
import { Frequency } from '../types.js';
import { easter } from './easter.js';
import { rebuildMonth } from './monthinfo.js';
import { rebuildYear } from './yearinfo.js';
// =============================================================================
// Iterinfo
// =============================================================================
export default class Iterinfo {
    options;
    yearinfo;
    monthinfo;
    eastermask;
    // eslint-disable-next-line no-empty-function
    constructor(options) {
        this.options = options;
    }
    rebuild(year, month) {
        const options = this.options;
        if (year !== this.lastyear) {
            this.yearinfo = rebuildYear(year, options);
        }
        if (notEmpty(options.bynweekday) &&
            (month !== this.lastmonth || year !== this.lastyear)) {
            const { yearlen, mrange, wdaymask } = this.yearinfo;
            this.monthinfo = rebuildMonth(year, month, yearlen, mrange, wdaymask, options);
        }
        if (isPresent(options.byeaster)) {
            this.eastermask = easter(year, options.byeaster);
        }
    }
    get lastyear() {
        return this.monthinfo ? this.monthinfo.lastyear : null;
    }
    get lastmonth() {
        return this.monthinfo ? this.monthinfo.lastmonth : null;
    }
    get yearlen() {
        return this.yearinfo.yearlen;
    }
    get yearordinal() {
        return this.yearinfo.yearordinal;
    }
    get mrange() {
        return this.yearinfo.mrange;
    }
    get wdaymask() {
        return this.yearinfo.wdaymask;
    }
    get mmask() {
        return this.yearinfo.mmask;
    }
    get wnomask() {
        return this.yearinfo.wnomask;
    }
    get nwdaymask() {
        return this.monthinfo ? this.monthinfo.nwdaymask : [];
    }
    get nextyearlen() {
        return this.yearinfo.nextyearlen;
    }
    get mdaymask() {
        return this.yearinfo.mdaymask;
    }
    get nmdaymask() {
        return this.yearinfo.nmdaymask;
    }
    ydayset() {
        return [range(this.yearlen), 0, this.yearlen];
    }
    mdayset(_, month) {
        const start = this.mrange[month - 1];
        const end = this.mrange[month];
        const set = repeat(null, this.yearlen);
        for (let i = start; i < end; i++)
            set[i] = i;
        return [set, start, end];
    }
    wdayset(year, month, day) {
        // We need to handle cross-year weeks here.
        const set = repeat(null, this.yearlen + 7);
        let i = toOrdinal(datetime(year, month, day)) - this.yearordinal;
        const start = i;
        for (let j = 0; j < 7; j++) {
            set[i] = i;
            ++i;
            if (this.wdaymask[i] === this.options.wkst)
                break;
        }
        return [set, start, i];
    }
    ddayset(year, month, day) {
        const set = repeat(null, this.yearlen);
        const i = toOrdinal(datetime(year, month, day)) - this.yearordinal;
        set[i] = i;
        return [set, i, i + 1];
    }
    htimeset(hour, _, second, millisecond) {
        let set = [];
        this.options.byminute.forEach((minute) => {
            set = set.concat(this.mtimeset(hour, minute, second, millisecond));
        });
        sort(set);
        return set;
    }
    mtimeset(hour, minute, _, millisecond) {
        const set = this.options.bysecond.map((second) => new Time(hour, minute, second, millisecond));
        sort(set);
        return set;
    }
    stimeset(hour, minute, second, millisecond) {
        return [new Time(hour, minute, second, millisecond)];
    }
    getdayset(freq) {
        switch (freq) {
            case Frequency.YEARLY:
                return this.ydayset.bind(this);
            case Frequency.MONTHLY:
                return this.mdayset.bind(this);
            case Frequency.WEEKLY:
                return this.wdayset.bind(this);
            case Frequency.DAILY:
                return this.ddayset.bind(this);
            default:
                return this.ddayset.bind(this);
        }
    }
    gettimeset(freq) {
        switch (freq) {
            case Frequency.HOURLY:
                return this.htimeset.bind(this);
            case Frequency.MINUTELY:
                return this.mtimeset.bind(this);
            case Frequency.SECONDLY:
                return this.stimeset.bind(this);
        }
    }
}
//# sourceMappingURL=index.js.map