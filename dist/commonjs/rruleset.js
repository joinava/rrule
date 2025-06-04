"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RRuleSet = void 0;
const rrule_js_1 = require("./rrule.js");
const dateutil_js_1 = require("./dateutil.js");
const helpers_js_1 = require("./helpers.js");
const iterset_js_1 = require("./iterset.js");
const rrulestr_js_1 = require("./rrulestr.js");
const optionstostring_js_1 = require("./optionstostring.js");
function createGetterSetter(fieldName) {
    return (field) => {
        if (field !== undefined) {
            this[`_${fieldName}`] = field;
        }
        if (this[`_${fieldName}`] !== undefined) {
            return this[`_${fieldName}`];
        }
        for (let i = 0; i < this._rrule.length; i++) {
            const field = this._rrule[i].origOptions[fieldName];
            if (field) {
                return field;
            }
        }
    };
}
class RRuleSet extends rrule_js_1.RRule {
    _rrule;
    _rdate;
    _exrule;
    _exdate;
    _dtstart;
    _tzid;
    /**
     *
     * @param {Boolean?} noCache
     * The same stratagy as RRule on cache, default to false
     * @constructor
     */
    constructor(noCache = false) {
        super({}, noCache);
        this._rrule = [];
        this._rdate = [];
        this._exrule = [];
        this._exdate = [];
    }
    dtstart = createGetterSetter.apply(this, ['dtstart']);
    tzid = createGetterSetter.apply(this, ['tzid']);
    _iter(iterResult) {
        return (0, iterset_js_1.iterSet)(iterResult, this._rrule, this._exrule, this._rdate, this._exdate, this.tzid());
    }
    /**
     * Adds an RRule to the set
     *
     * @param {RRule}
     */
    rrule(rrule) {
        _addRule(rrule, this._rrule);
    }
    /**
     * Adds an EXRULE to the set
     *
     * @param {RRule}
     */
    exrule(rrule) {
        _addRule(rrule, this._exrule);
    }
    /**
     * Adds an RDate to the set
     *
     * @param {Date}
     */
    rdate(date) {
        _addDate(date, this._rdate);
    }
    /**
     * Adds an EXDATE to the set
     *
     * @param {Date}
     */
    exdate(date) {
        _addDate(date, this._exdate);
    }
    /**
     * Get list of included rrules in this recurrence set.
     *
     * @return List of rrules
     */
    rrules() {
        return this._rrule.map((e) => (0, rrulestr_js_1.rrulestr)(e.toString()));
    }
    /**
     * Get list of excluded rrules in this recurrence set.
     *
     * @return List of exrules
     */
    exrules() {
        return this._exrule.map((e) => (0, rrulestr_js_1.rrulestr)(e.toString()));
    }
    /**
     * Get list of included datetimes in this recurrence set.
     *
     * @return List of rdates
     */
    rdates() {
        return this._rdate.map((e) => new Date(e.getTime()));
    }
    /**
     * Get list of included datetimes in this recurrence set.
     *
     * @return List of exdates
     */
    exdates() {
        return this._exdate.map((e) => new Date(e.getTime()));
    }
    valueOf() {
        let result = [];
        if (!this._rrule.length && this._dtstart) {
            result = result.concat((0, optionstostring_js_1.optionsToString)({ dtstart: this._dtstart }));
        }
        this._rrule.forEach(function (rrule) {
            result = result.concat(rrule.toString().split('\n'));
        });
        this._exrule.forEach(function (exrule) {
            result = result.concat(exrule
                .toString()
                .split('\n')
                .map((line) => line.replace(/^RRULE:/, 'EXRULE:'))
                .filter((line) => !/^DTSTART/.test(line)));
        });
        if (this._rdate.length) {
            result.push(rdatesToString('RDATE', this._rdate, this.tzid()));
        }
        if (this._exdate.length) {
            result.push(rdatesToString('EXDATE', this._exdate, this.tzid()));
        }
        return result;
    }
    /**
     * to generate recurrence field such as:
     * DTSTART:19970902T010000Z
     * RRULE:FREQ=YEARLY;COUNT=2;BYDAY=TU
     * RRULE:FREQ=YEARLY;COUNT=1;BYDAY=TH
     */
    toString() {
        return this.valueOf().join('\n');
    }
    /**
     * Create a new RRuleSet Object completely base on current instance
     */
    clone() {
        const rrs = new RRuleSet(!!this._cache);
        this._rrule.forEach((rule) => rrs.rrule(rule.clone()));
        this._exrule.forEach((rule) => rrs.exrule(rule.clone()));
        this._rdate.forEach((date) => rrs.rdate(new Date(date.getTime())));
        this._exdate.forEach((date) => rrs.exdate(new Date(date.getTime())));
        return rrs;
    }
}
exports.RRuleSet = RRuleSet;
function _addRule(rrule, collection) {
    if (!(rrule instanceof rrule_js_1.RRule)) {
        throw new TypeError(String(rrule) + ' is not RRule instance');
    }
    if (!(0, helpers_js_1.includes)(collection.map(String), String(rrule))) {
        collection.push(rrule);
    }
}
function _addDate(date, collection) {
    if (!(date instanceof Date)) {
        throw new TypeError(String(date) + ' is not Date instance');
    }
    if (!(0, helpers_js_1.includes)(collection.map(Number), Number(date))) {
        collection.push(date);
        (0, dateutil_js_1.sort)(collection);
    }
}
function rdatesToString(param, rdates, tzid) {
    const isUTC = !tzid || tzid.toUpperCase() === 'UTC';
    const header = isUTC ? `${param}:` : `${param};TZID=${tzid}:`;
    const dateString = rdates
        .map((rdate) => (0, dateutil_js_1.timeToUntilString)(rdate.valueOf(), isUTC))
        .join(',');
    return `${header}${dateString}`;
}
//# sourceMappingURL=rruleset.js.map