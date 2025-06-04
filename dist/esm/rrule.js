import { isValidDate } from './dateutil.js';
import IterResult from './iterresult.js';
import CallbackIterResult from './callbackiterresult.js';
import { fromText, parseText, toText, isFullyConvertible } from './nlp/index.js';
import { Frequency, } from './types.js';
import { parseOptions, initializeOptions } from './parseoptions.js';
import { parseString } from './parsestring.js';
import { optionsToString } from './optionstostring.js';
import { Cache } from './cache.js';
import { Weekday } from './weekday.js';
import { iter } from './iter/index.js';
// =============================================================================
// RRule
// =============================================================================
export const Days = {
    MO: new Weekday(0),
    TU: new Weekday(1),
    WE: new Weekday(2),
    TH: new Weekday(3),
    FR: new Weekday(4),
    SA: new Weekday(5),
    SU: new Weekday(6),
};
export const DEFAULT_OPTIONS = {
    freq: Frequency.YEARLY,
    dtstart: null,
    interval: 1,
    wkst: Days.MO,
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
export const defaultKeys = Object.keys(DEFAULT_OPTIONS);
/**
 *
 * @param {Options?} options - see <http://labix.org/python-dateutil/#head-cf004ee9a75592797e076752b2a889c10f445418>
 * - The only required option is `freq`, one of RRule.YEARLY, RRule.MONTHLY, ...
 * @constructor
 */
export class RRule {
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
    static YEARLY = Frequency.YEARLY;
    static MONTHLY = Frequency.MONTHLY;
    static WEEKLY = Frequency.WEEKLY;
    static DAILY = Frequency.DAILY;
    static HOURLY = Frequency.HOURLY;
    static MINUTELY = Frequency.MINUTELY;
    static SECONDLY = Frequency.SECONDLY;
    static MO = Days.MO;
    static TU = Days.TU;
    static WE = Days.WE;
    static TH = Days.TH;
    static FR = Days.FR;
    static SA = Days.SA;
    static SU = Days.SU;
    constructor(options = {}, noCache = false) {
        // RFC string
        this._cache = noCache ? null : new Cache();
        // used by toString()
        this.origOptions = initializeOptions(options);
        const { parsedOptions } = parseOptions(options);
        this.options = parsedOptions;
    }
    static parseText(text, language) {
        return parseText(text, language);
    }
    static fromText(text, language) {
        return fromText(text, language);
    }
    static parseString = parseString;
    static fromString(str) {
        return new RRule(RRule.parseString(str) || undefined);
    }
    static optionsToString = optionsToString;
    _iter(iterResult) {
        return iter(iterResult, this.options);
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
            return this._iter(new CallbackIterResult('all', {}, iterator));
        }
        let result = this._cacheGet('all');
        if (result === false) {
            result = this._iter(new IterResult('all', {}));
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
        if (!isValidDate(after) || !isValidDate(before)) {
            throw new Error('Invalid date passed in to RRule.between');
        }
        const args = {
            before,
            after,
            inc,
        };
        if (iterator) {
            return this._iter(new CallbackIterResult('between', args, iterator));
        }
        let result = this._cacheGet('between', args);
        if (result === false) {
            result = this._iter(new IterResult('between', args));
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
        if (!isValidDate(dt)) {
            throw new Error('Invalid date passed in to RRule.before');
        }
        const args = { dt: dt, inc: inc };
        let result = this._cacheGet('before', args);
        if (result === false) {
            result = this._iter(new IterResult('before', args));
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
        if (!isValidDate(dt)) {
            throw new Error('Invalid date passed in to RRule.after');
        }
        const args = { dt: dt, inc: inc };
        let result = this._cacheGet('after', args);
        if (result === false) {
            result = this._iter(new IterResult('after', args));
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
        return optionsToString(this.origOptions);
    }
    /**
     * Will convert all rules described in nlp:ToText
     * to text.
     */
    toText(gettext, language, dateFormatter) {
        return toText(this, gettext, language, dateFormatter);
    }
    isFullyConvertibleToText() {
        return isFullyConvertible(this);
    }
    /**
     * @return a RRule instance with the same freq and options
     * as this one (cache is not cloned)
     */
    clone() {
        return new RRule(this.origOptions);
    }
}
//# sourceMappingURL=rrule.js.map