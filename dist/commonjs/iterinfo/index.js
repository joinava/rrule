"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datetime_js_1 = require("../datetime.js");
const dateutil_js_1 = require("../dateutil.js");
const helpers_js_1 = require("../helpers.js");
const types_js_1 = require("../types.js");
const easter_js_1 = require("./easter.js");
const monthinfo_js_1 = require("./monthinfo.js");
const yearinfo_js_1 = require("./yearinfo.js");
// =============================================================================
// Iterinfo
// =============================================================================
class Iterinfo {
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
            this.yearinfo = (0, yearinfo_js_1.rebuildYear)(year, options);
        }
        if ((0, helpers_js_1.notEmpty)(options.bynweekday) &&
            (month !== this.lastmonth || year !== this.lastyear)) {
            const { yearlen, mrange, wdaymask } = this.yearinfo;
            this.monthinfo = (0, monthinfo_js_1.rebuildMonth)(year, month, yearlen, mrange, wdaymask, options);
        }
        if ((0, helpers_js_1.isPresent)(options.byeaster)) {
            this.eastermask = (0, easter_js_1.easter)(year, options.byeaster);
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
        return [(0, helpers_js_1.range)(this.yearlen), 0, this.yearlen];
    }
    mdayset(_, month) {
        const start = this.mrange[month - 1];
        const end = this.mrange[month];
        const set = (0, helpers_js_1.repeat)(null, this.yearlen);
        for (let i = start; i < end; i++)
            set[i] = i;
        return [set, start, end];
    }
    wdayset(year, month, day) {
        // We need to handle cross-year weeks here.
        const set = (0, helpers_js_1.repeat)(null, this.yearlen + 7);
        let i = (0, dateutil_js_1.toOrdinal)((0, dateutil_js_1.datetime)(year, month, day)) - this.yearordinal;
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
        const set = (0, helpers_js_1.repeat)(null, this.yearlen);
        const i = (0, dateutil_js_1.toOrdinal)((0, dateutil_js_1.datetime)(year, month, day)) - this.yearordinal;
        set[i] = i;
        return [set, i, i + 1];
    }
    htimeset(hour, _, second, millisecond) {
        let set = [];
        this.options.byminute.forEach((minute) => {
            set = set.concat(this.mtimeset(hour, minute, second, millisecond));
        });
        (0, dateutil_js_1.sort)(set);
        return set;
    }
    mtimeset(hour, minute, _, millisecond) {
        const set = this.options.bysecond.map((second) => new datetime_js_1.Time(hour, minute, second, millisecond));
        (0, dateutil_js_1.sort)(set);
        return set;
    }
    stimeset(hour, minute, second, millisecond) {
        return [new datetime_js_1.Time(hour, minute, second, millisecond)];
    }
    getdayset(freq) {
        switch (freq) {
            case types_js_1.Frequency.YEARLY:
                return this.ydayset.bind(this);
            case types_js_1.Frequency.MONTHLY:
                return this.mdayset.bind(this);
            case types_js_1.Frequency.WEEKLY:
                return this.wdayset.bind(this);
            case types_js_1.Frequency.DAILY:
                return this.ddayset.bind(this);
            default:
                return this.ddayset.bind(this);
        }
    }
    gettimeset(freq) {
        switch (freq) {
            case types_js_1.Frequency.HOURLY:
                return this.htimeset.bind(this);
            case types_js_1.Frequency.MINUTELY:
                return this.mtimeset.bind(this);
            case types_js_1.Frequency.SECONDLY:
                return this.stimeset.bind(this);
        }
    }
}
exports.default = Iterinfo;
//# sourceMappingURL=index.js.map