"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseString = parseString;
exports.parseDtstart = parseDtstart;
const types_js_1 = require("./types.js");
const weekday_js_1 = require("./weekday.js");
const dateutil_js_1 = require("./dateutil.js");
const rrule_js_1 = require("./rrule.js");
function parseString(rfcString) {
    const options = rfcString
        .split('\n')
        .map(parseLine)
        .filter((x) => x !== null);
    return { ...options[0], ...options[1] };
}
function parseDtstart(line) {
    const options = {};
    const dtstartWithZone = /DTSTART(?:;TZID=([^:=]+?))?(?::|=)([^;\s]+)/i.exec(line);
    if (!dtstartWithZone) {
        return options;
    }
    const [, tzid, dtstart] = dtstartWithZone;
    if (tzid) {
        options.tzid = tzid;
    }
    options.dtstart = (0, dateutil_js_1.untilStringToDate)(dtstart);
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
                options.freq = types_js_1.Frequency[value.toUpperCase()];
                break;
            case 'WKST':
                options.wkst = rrule_js_1.Days[value.toUpperCase()];
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
                options.until = (0, dateutil_js_1.untilStringToDate)(value);
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
            return rrule_js_1.Days[day]; // wday instanceof Weekday
        }
        // -1MO, +3FR, 1SO, 13TU ...
        const parts = day.match(/^([+-]?\d{1,2})([A-Z]{2})$/);
        if (!parts || parts.length < 3) {
            throw new SyntaxError(`Invalid weekday string: ${day}`);
        }
        const n = Number(parts[1]);
        const wdaypart = parts[2];
        const wday = rrule_js_1.Days[wdaypart].weekday;
        return new weekday_js_1.Weekday(wday, n);
    });
}
//# sourceMappingURL=parsestring.js.map