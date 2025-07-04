import { RRule, DEFAULT_OPTIONS } from './rrule.js';
import { includes, isPresent, isArray, isNumber, toArray } from './helpers.js';
import { Weekday } from './weekday.js';
import { timeToUntilString } from './dateutil.js';
import { DateWithZone } from './datewithzone.js';
export function optionsToString(options) {
    const rrule = [];
    let dtstart = '';
    const keys = Object.keys(options);
    const defaultKeys = Object.keys(DEFAULT_OPTIONS);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'tzid')
            continue;
        if (!includes(defaultKeys, keys[i]))
            continue;
        let key = keys[i].toUpperCase();
        const value = options[keys[i]];
        let outValue = '';
        if (!isPresent(value) || (isArray(value) && !value.length))
            continue;
        switch (key) {
            case 'FREQ':
                outValue = RRule.FREQUENCIES[options.freq];
                break;
            case 'WKST':
                if (isNumber(value)) {
                    outValue = new Weekday(value).toString();
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
                outValue = toArray(value)
                    .map((wday) => {
                    if (wday instanceof Weekday) {
                        return wday;
                    }
                    if (isArray(wday)) {
                        return new Weekday(wday[0], wday[1]);
                    }
                    return new Weekday(wday);
                })
                    .toString();
                break;
            case 'DTSTART':
                dtstart = buildDtstart(value, options.tzid);
                break;
            case 'UNTIL':
                outValue = timeToUntilString(value, !options.tzid);
                break;
            default:
                if (isArray(value)) {
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
    return 'DTSTART' + new DateWithZone(new Date(dtstart), tzid).toString();
}
//# sourceMappingURL=optionstostring.js.map