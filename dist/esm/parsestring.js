import { Frequency } from './types.js';
import { Weekday } from './weekday.js';
import { untilStringToDate } from './dateutil.js';
import { Days } from './rrule.js';
export function parseString(rfcString) {
    const options = rfcString
        .split('\n')
        .map(parseLine)
        .filter((x) => x !== null);
    return { ...options[0], ...options[1] };
}
export function parseDtstart(line) {
    const options = {};
    const dtstartWithZone = /DTSTART(?:;TZID=([^:=]+?))?(?::|=)([^;\s]+)/i.exec(line);
    if (!dtstartWithZone) {
        return options;
    }
    const [, tzid, dtstart] = dtstartWithZone;
    if (tzid) {
        options.tzid = tzid;
    }
    options.dtstart = untilStringToDate(dtstart);
    return options;
}
function parseLine(rfcString) {
    rfcString = rfcString.replace(/^\s+|\s+$/, '');
    if (!rfcString.length)
        return null;
    const header = /^([A-Z]+?)[:;]/.exec(rfcString.toUpperCase());
    if (!header) {
        return parseRrule(rfcString);
    }
    const [, key] = header;
    switch (key.toUpperCase()) {
        case 'RRULE':
        case 'EXRULE':
            return parseRrule(rfcString);
        case 'DTSTART':
            return parseDtstart(rfcString);
        default:
            throw new Error(`Unsupported RFC prop ${key} in ${rfcString}`);
    }
}
function parseRrule(line) {
    const strippedLine = line.replace(/^RRULE:/i, '');
    const options = parseDtstart(strippedLine);
    const attrs = line.replace(/^(?:RRULE|EXRULE):/i, '').split(';');
    attrs.forEach((attr) => {
        const [key, value] = attr.split('=');
        switch (key.toUpperCase()) {
            case 'FREQ':
                options.freq = Frequency[value.toUpperCase()];
                break;
            case 'WKST':
                options.wkst = Days[value.toUpperCase()];
                break;
            case 'COUNT':
            case 'INTERVAL':
            case 'BYSETPOS':
            case 'BYMONTH':
            case 'BYMONTHDAY':
            case 'BYYEARDAY':
            case 'BYWEEKNO':
            case 'BYHOUR':
            case 'BYMINUTE':
            case 'BYSECOND':
                const num = parseNumber(value);
                const optionKey = key.toLowerCase();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                options[optionKey] = num;
                break;
            case 'BYWEEKDAY':
            case 'BYDAY':
                options.byweekday = parseWeekday(value);
                break;
            case 'DTSTART':
            case 'TZID':
                // for backwards compatibility
                const dtstart = parseDtstart(line);
                options.tzid = dtstart.tzid;
                options.dtstart = dtstart.dtstart;
                break;
            case 'UNTIL':
                options.until = untilStringToDate(value);
                break;
            case 'BYEASTER':
                options.byeaster = Number(value);
                break;
            default:
                throw new Error("Unknown RRULE property '" + key + "'");
        }
    });
    return options;
}
function parseNumber(value) {
    if (value.indexOf(',') !== -1) {
        const values = value.split(',');
        return values.map(parseIndividualNumber);
    }
    return parseIndividualNumber(value);
}
function parseIndividualNumber(value) {
    if (/^[+-]?\d+$/.test(value)) {
        return Number(value);
    }
    return value;
}
function parseWeekday(value) {
    const days = value.split(',');
    return days.map((day) => {
        if (day.length === 2) {
            // MO, TU, ...
            return Days[day]; // wday instanceof Weekday
        }
        // -1MO, +3FR, 1SO, 13TU ...
        const parts = day.match(/^([+-]?\d{1,2})([A-Z]{2})$/);
        if (!parts || parts.length < 3) {
            throw new SyntaxError(`Invalid weekday string: ${day}`);
        }
        const n = Number(parts[1]);
        const wdaypart = parts[2];
        const wday = Days[wdaypart].weekday;
        return new Weekday(wday, n);
    });
}
//# sourceMappingURL=parsestring.js.map