"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateInTimeZone = exports.untilStringToDate = exports.timeToUntilString = exports.sort = exports.cloneDates = exports.clone = exports.combine = exports.monthRange = exports.getWeekday = exports.getMonthDays = exports.fromOrdinal = exports.toOrdinal = exports.daysBetween = exports.tzOffset = exports.isValidDate = exports.isDate = exports.isLeapYear = exports.getYearDay = exports.PY_WEEKDAYS = exports.ORDINAL_BASE = exports.MAXYEAR = exports.ONE_DAY = exports.MONTH_DAYS = exports.datetime = void 0;
const helpers_js_1 = require("./helpers.js");
const datetime = function (y, m, d, h = 0, i = 0, s = 0) {
    return new Date(Date.UTC(y, m - 1, d, h, i, s));
};
exports.datetime = datetime;
/**
 * General date-related utilities.
 * Also handles several incompatibilities between JavaScript and Python
 *
 */
exports.MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/**
 * Number of milliseconds of one day
 */
exports.ONE_DAY = 1000 * 60 * 60 * 24;
/**
 * @see: <http://docs.python.org/library/datetime.html#datetime.MAXYEAR>
 */
exports.MAXYEAR = 9999;
/**
 * Python uses 1-Jan-1 as the base for calculating ordinals but we don't
 * want to confuse the JS engine with milliseconds > Number.MAX_NUMBER,
 * therefore we use 1-Jan-1970 instead
 */
exports.ORDINAL_BASE = (0, exports.datetime)(1970, 1, 1);
/**
 * Python: MO-SU: 0 - 6
 * JS: SU-SAT 0 - 6
 */
exports.PY_WEEKDAYS = [6, 0, 1, 2, 3, 4, 5];
/**
 * py_date.timetuple()[7]
 */
const getYearDay = function (date) {
    const dateNoTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return (Math.ceil((dateNoTime.valueOf() - new Date(date.getUTCFullYear(), 0, 1).valueOf()) /
        exports.ONE_DAY) + 1);
};
exports.getYearDay = getYearDay;
const isLeapYear = function (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
exports.isLeapYear = isLeapYear;
const isDate = function (value) {
    return value instanceof Date;
};
exports.isDate = isDate;
const isValidDate = function (value) {
    return (0, exports.isDate)(value) && !isNaN(value.getTime());
};
exports.isValidDate = isValidDate;
/**
 * @return {Number} the date's timezone offset in ms
 */
const tzOffset = function (date) {
    return date.getTimezoneOffset() * 60 * 1000;
};
exports.tzOffset = tzOffset;
/**
 * @see: <http://www.mcfedries.com/JavaScript/DaysBetween.asp>
 */
const daysBetween = function (date1, date2) {
    // The number of milliseconds in one day
    // Convert both dates to milliseconds
    const date1ms = date1.getTime();
    const date2ms = date2.getTime();
    // Calculate the difference in milliseconds
    const differencems = date1ms - date2ms;
    // Convert back to days and return
    return Math.round(differencems / exports.ONE_DAY);
};
exports.daysBetween = daysBetween;
/**
 * @see: <http://docs.python.org/library/datetime.html#datetime.date.toordinal>
 */
const toOrdinal = function (date) {
    return (0, exports.daysBetween)(date, exports.ORDINAL_BASE);
};
exports.toOrdinal = toOrdinal;
/**
 * @see - <http://docs.python.org/library/datetime.html#datetime.date.fromordinal>
 */
const fromOrdinal = function (ordinal) {
    return new Date(exports.ORDINAL_BASE.getTime() + ordinal * exports.ONE_DAY);
};
exports.fromOrdinal = fromOrdinal;
const getMonthDays = function (date) {
    const month = date.getUTCMonth();
    return month === 1 && (0, exports.isLeapYear)(date.getUTCFullYear())
        ? 29
        : exports.MONTH_DAYS[month];
};
exports.getMonthDays = getMonthDays;
/**
 * @return {Number} python-like weekday
 */
const getWeekday = function (date) {
    return exports.PY_WEEKDAYS[date.getUTCDay()];
};
exports.getWeekday = getWeekday;
/**
 * @see: <http://docs.python.org/library/calendar.html#calendar.monthrange>
 */
const monthRange = function (year, month) {
    const date = (0, exports.datetime)(year, month + 1, 1);
    return [(0, exports.getWeekday)(date), (0, exports.getMonthDays)(date)];
};
exports.monthRange = monthRange;
/**
 * @see: <http://docs.python.org/library/datetime.html#datetime.datetime.combine>
 */
const combine = function (date, time) {
    time = time || date;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()));
};
exports.combine = combine;
const clone = function (date) {
    const dolly = new Date(date.getTime());
    return dolly;
};
exports.clone = clone;
const cloneDates = function (dates) {
    const clones = [];
    for (let i = 0; i < dates.length; i++) {
        clones.push((0, exports.clone)(dates[i]));
    }
    return clones;
};
exports.cloneDates = cloneDates;
/**
 * Sorts an array of Date or Time objects
 */
const sort = function (dates) {
    dates.sort(function (a, b) {
        return a.getTime() - b.getTime();
    });
};
exports.sort = sort;
const timeToUntilString = function (time, utc = true) {
    const date = new Date(time);
    return [
        (0, helpers_js_1.padStart)(date.getUTCFullYear().toString(), 4, '0'),
        (0, helpers_js_1.padStart)(date.getUTCMonth() + 1, 2, '0'),
        (0, helpers_js_1.padStart)(date.getUTCDate(), 2, '0'),
        'T',
        (0, helpers_js_1.padStart)(date.getUTCHours(), 2, '0'),
        (0, helpers_js_1.padStart)(date.getUTCMinutes(), 2, '0'),
        (0, helpers_js_1.padStart)(date.getUTCSeconds(), 2, '0'),
        utc ? 'Z' : '',
    ].join('');
};
exports.timeToUntilString = timeToUntilString;
const untilStringToDate = function (until) {
    const re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/;
    const bits = re.exec(until);
    if (!bits)
        throw new Error(`Invalid UNTIL value: ${until}`);
    return new Date(Date.UTC(parseInt(bits[1], 10), parseInt(bits[2], 10) - 1, parseInt(bits[3], 10), parseInt(bits[5], 10) || 0, parseInt(bits[6], 10) || 0, parseInt(bits[7], 10) || 0));
};
exports.untilStringToDate = untilStringToDate;
const dateTZtoISO8601 = function (date, timeZone) {
    // date format for sv-SE is almost ISO8601
    const dateStr = date.toLocaleString('sv-SE', { timeZone });
    // '2023-02-07 10:41:36'
    return dateStr.replace(' ', 'T') + 'Z';
};
const dateInTimeZone = function (date, timeZone) {
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Date constructor can only reliably parse dates in ISO8601 format
    const dateInLocalTZ = new Date(dateTZtoISO8601(date, localTimeZone));
    const dateInTargetTZ = new Date(dateTZtoISO8601(date, timeZone ?? 'UTC'));
    const tzOffset = dateInTargetTZ.getTime() - dateInLocalTZ.getTime();
    return new Date(date.getTime() - tzOffset);
};
exports.dateInTimeZone = dateInTimeZone;
//# sourceMappingURL=dateutil.js.map