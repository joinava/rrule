"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RRule = exports.defaultKeys = exports.DEFAULT_OPTIONS = exports.Days = void 0;
const dateutil_js_1 = require("./dateutil.js");
const iterresult_js_1 = __importDefault(require("./iterresult.js"));
const callbackiterresult_js_1 = __importDefault(require("./callbackiterresult.js"));
const index_js_1 = require("./nlp/index.js");
const types_js_1 = require("./types.js");
const parseoptions_js_1 = require("./parseoptions.js");
const parsestring_js_1 = require("./parsestring.js");
const optionstostring_js_1 = require("./optionstostring.js");
const cache_js_1 = require("./cache.js");
const weekday_js_1 = require("./weekday.js");
const index_js_2 = require("./iter/index.js");
// =============================================================================
// RRule
// =============================================================================
exports.Days = {
    MO: new weekday_js_1.Weekday(0),
    TU: new weekday_js_1.Weekday(1),
    WE: new weekday_js_1.Weekday(2),
    TH: new weekday_js_1.Weekday(3),
    FR: new weekday_js_1.Weekday(4),
    SA: new weekday_js_1.Weekday(5),
    SU: new weekday_js_1.Weekday(6),
};
exports.DEFAULT_OPTIONS = {
    freq: types_js_1.Frequency.YEARLY,
    dtstart: null,
    interval: 1,
    wkst: exports.Days.MO,
    count: null,
    until: null,
    tzid: null,
    bysetpos: null,
    bymonth: null,
    bymonthday: null,
    bynmonthday: null,
    byyearday: null,
    byweekno: null,
    byweekday: null,
    bynweekday: null,
    byhour: null,
    byminute: null,
    bysecond: null,
    byeaster: null,
};
exports.defaultKeys = Object.keys(exports.DEFAULT_OPTIONS);
/**
 *
 * @param {Options?} options - see <http://labix.org/python-dateutil/#head-cf004ee9a75592797e076752b2a889c10f445418>
 * - The only required option is `freq`, one of RRule.YEARLY, RRule.MONTHLY, ...
 * @constructor
 */
class RRule {
    _cache;
    origOptions;
    options;
    // RRule class 'consta.js'
    static FREQUENCIES = [
        'YEARLY',
        'MONTHLY',
        'WEEKLY',
        'DAILY',
        'HOURLY',
        'MINUTELY',
        'SECONDLY',
    ];
    static YEARLY = types_js_1.Frequency.YEARLY;
    static MONTHLY = types_js_1.Frequency.MONTHLY;
    static WEEKLY = types_js_1.Frequency.WEEKLY;
    static DAILY = types_js_1.Frequency.DAILY;
    static HOURLY = types_js_1.Frequency.HOURLY;
    static MINUTELY = types_js_1.Frequency.MINUTELY;
    static SECONDLY = types_js_1.Frequency.SECONDLY;
    static MO = exports.Days.MO;
    static TU = exports.Days.TU;
    static WE = exports.Days.WE;
    static TH = exports.Days.TH;
    static FR = exports.Days.FR;
    static SA = exports.Days.SA;
    static SU = exports.Days.SU;
    constructor(options = {}, noCache = false) {
        // RFC string
        this._cache = noCache ? null : new cache_js_1.Cache();
        // used by toString()
        this.origOptions = (0, parseoptions_js_1.initializeOptions)(options);
        const { parsedOptions } = (0, parseoptions_js_1.parseOptions)(options);
        this.options = parsedOptions;
    }
    static parseText(text, language) {
        return (0, index_js_1.parseText)(text, language);
    }
    static fromText(text, language) {
        return (0, index_js_1.fromText)(text, language);
    }
    static parseString = parsestring_js_1.parseString;
    static fromString(str) {
        return new RRule(RRule.parseString(str) || undefined);
    }
    static optionsToString = optionstostring_js_1.optionsToString;
    _iter(iterResult) {
        return (0, index_js_2.iter)(iterResult, this.options);
    }
    _cacheGet(what, args) {
        if (!this._cache)
            return false;
        return this._cache._cacheGet(what, args);
    }
    _cacheAdd(what, value, args) {
        if (!this._cache)
            return;
        return this._cache._cacheAdd(what, value, args);
    }
    /**
     * @param {Function} iterator - optional function that will be called
     * on each date that is added. It can return false
     * to stop the iteration.
     * @return Array containing all recurrences.
     */
    all(iterator) {
        if (iterator) {
            return this._iter(new callbackiterresult_js_1.default('all', {}, iterator));
        }
        let result = this._cacheGet('all');
        if (result === false) {
            result = this._iter(new iterresult_js_1.default('all', {}));
            this._cacheAdd('all', result);
        }
        return result;
    }
    /**
     * Returns all the occurrences of the rrule between after and before.
     * The inc keyword defines what happens if after and/or before are
     * themselves occurrences. With inc == True, they will be included in the
     * list, if they are found in the recurrence set.
     *
     * @return Array
     */
    between(after, before, inc = false, iterator) {
        if (!(0, dateutil_js_1.isValidDate)(after) || !(0, dateutil_js_1.isValidDate)(before)) {
            throw new Error('Invalid date passed in to RRule.between');
        }
        const args = {
            before,
            after,
            inc,
        };
        if (iterator) {
            return this._iter(new callbackiterresult_js_1.default('between', args, iterator));
        }
        let result = this._cacheGet('between', args);
        if (result === false) {
            result = this._iter(new iterresult_js_1.default('between', args));
            this._cacheAdd('between', result, args);
        }
        return result;
    }
    /**
     * Returns the last recurrence before the given datetime instance.
     * The inc keyword defines what happens if dt is an occurrence.
     * With inc == True, if dt itself is an occurrence, it will be returned.
     *
     * @return Date or null
     */
    before(dt, inc = false) {
        if (!(0, dateutil_js_1.isValidDate)(dt)) {
            throw new Error('Invalid date passed in to RRule.before');
        }
        const args = { dt: dt, inc: inc };
        let result = this._cacheGet('before', args);
        if (result === false) {
            result = this._iter(new iterresult_js_1.default('before', args));
            this._cacheAdd('before', result, args);
        }
        return result;
    }
    /**
     * Returns the first recurrence after the given datetime instance.
     * The inc keyword defines what happens if dt is an occurrence.
     * With inc == True, if dt itself is an occurrence, it will be returned.
     *
     * @return Date or null
     */
    after(dt, inc = false) {
        if (!(0, dateutil_js_1.isValidDate)(dt)) {
            throw new Error('Invalid date passed in to RRule.after');
        }
        const args = { dt: dt, inc: inc };
        let result = this._cacheGet('after', args);
        if (result === false) {
            result = this._iter(new iterresult_js_1.default('after', args));
            this._cacheAdd('after', result, args);
        }
        return result;
    }
    /**
     * Returns the number of recurrences in this set. It will have go trough
     * the whole recurrence, if this hasn't been done before.
     */
    count() {
        return this.all().length;
    }
    /**
     * Converts the rrule into its string representation
     *
     * @see <http://www.ietf.org/rfc/rfc2445.txt>
     * @return String
     */
    toString() {
        return (0, optionstostring_js_1.optionsToString)(this.origOptions);
    }
    /**
     * Will convert all rules described in nlp:ToText
     * to text.
     */
    toText(gettext, language, dateFormatter) {
        return (0, index_js_1.toText)(this, gettext, language, dateFormatter);
    }
    isFullyConvertibleToText() {
        return (0, index_js_1.isFullyConvertible)(this);
    }
    /**
     * @return a RRule instance with the same freq and options
     * as this one (cache is not cloned)
     */
    clone() {
        return new RRule(this.origOptions);
    }
}
exports.RRule = RRule;
//# sourceMappingURL=rrule.js.map