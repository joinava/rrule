"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsToString = optionsToString;
const rrule_js_1 = require("./rrule.js");
const helpers_js_1 = require("./helpers.js");
const weekday_js_1 = require("./weekday.js");
const dateutil_js_1 = require("./dateutil.js");
const datewithzone_js_1 = require("./datewithzone.js");
function optionsToString(options) {
    const rrule = [];
    let dtstart = '';
    const keys = Object.keys(options);
    const defaultKeys = Object.keys(rrule_js_1.DEFAULT_OPTIONS);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'tzid')
            continue;
        if (!(0, helpers_js_1.includes)(defaultKeys, keys[i]))
            continue;
        let key = keys[i].toUpperCase();
        const value = options[keys[i]];
        let outValue = '';
        if (!(0, helpers_js_1.isPresent)(value) || ((0, helpers_js_1.isArray)(value) && !value.length))
            continue;
        switch (key) {
            case 'FREQ':
                outValue = rrule_js_1.RRule.FREQUENCIES[options.freq];
                break;
            case 'WKST':
                if ((0, helpers_js_1.isNumber)(value)) {
                    outValue = new weekday_js_1.Weekday(value).toString();
                }
                else {
                    outValue = value.toString();
                }
                break;
            case 'BYWEEKDAY':
                /*
                  NOTE: BYWEEKDAY is a special case.
                  RRule() deconstructs the rule.options.byweekday array
                  into an array of Weekday arguments.
                  On the other hand, rule.origOptions is an array of Weekdays.
                  We need to handle both cases here.
                  It might be worth change RRule to keep the Weekdays.
        
                  Also, BYWEEKDAY (used by RRule) vs. BYDAY (RFC)
        
                  */
                key = 'BYDAY';
                outValue = (0, helpers_js_1.toArray)(value)
                    .map((wday) => {
                    if (wday instanceof weekday_js_1.Weekday) {
                        return wday;
                    }
                    if ((0, helpers_js_1.isArray)(wday)) {
                        return new weekday_js_1.Weekday(wday[0], wday[1]);
                    }
                    return new weekday_js_1.Weekday(wday);
                })
                    .toString();
                break;
            case 'DTSTART':
                dtstart = buildDtstart(value, options.tzid);
                break;
            case 'UNTIL':
                outValue = (0, dateutil_js_1.timeToUntilString)(value, !options.tzid);
                break;
            default:
                if ((0, helpers_js_1.isArray)(value)) {
                    const strValues = [];
                    for (let j = 0; j < value.length; j++) {
                        strValues[j] = String(value[j]);
                    }
                    outValue = strValues.toString();
                }
                else {
                    outValue = String(value);
                }
        }
        if (outValue) {
            rrule.push([key, outValue]);
        }
    }
    const rules = rrule
        .map(([key, value]) => `${key}=${value.toString()}`)
        .join(';');
    let ruleString = '';
    if (rules !== '') {
        ruleString = `RRULE:${rules}`;
    }
    return [dtstart, ruleString].filter((x) => !!x).join('\n');
}
function buildDtstart(dtstart, tzid) {
    if (!dtstart) {
        return '';
    }
    return 'DTSTART' + new datewithzone_js_1.DateWithZone(new Date(dtstart), tzid).toString();
}
//# sourceMappingURL=optionstostring.js.map