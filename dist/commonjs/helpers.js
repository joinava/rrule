"use strict";
// =============================================================================
// Helper functions
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.includes = exports.notEmpty = exports.empty = exports.divmod = exports.pymod = exports.split = exports.toArray = exports.repeat = exports.clone = exports.range = exports.isArray = exports.isWeekdayStr = exports.isNumber = exports.isPresent = void 0;
exports.padStart = padStart;
const weekday_js_1 = require("./weekday.js");
const isPresent = function (value) {
    return value !== null && value !== undefined;
};
exports.isPresent = isPresent;
const isNumber = function (value) {
    return typeof value === 'number';
};
exports.isNumber = isNumber;
const isWeekdayStr = function (value) {
    return typeof value === 'string' && weekday_js_1.ALL_WEEKDAYS.includes(value);
};
exports.isWeekdayStr = isWeekdayStr;
exports.isArray = Array.isArray;
/**
 * Simplified version of python's range()
 */
const range = function (start, end = start) {
    if (arguments.length === 1) {
        end = start;
        start = 0;
    }
    const rang = [];
    for (let i = start; i < end; i++)
        rang.push(i);
    return rang;
};
exports.range = range;
const clone = function (array) {
    return [].concat(array);
};
exports.clone = clone;
const repeat = function (value, times) {
    let i = 0;
    const array = [];
    if ((0, exports.isArray)(value)) {
        for (; i < times; i++)
            array[i] = [].concat(value);
    }
    else {
        for (; i < times; i++)
            array[i] = value;
    }
    return array;
};
exports.repeat = repeat;
const toArray = function (item) {
    if ((0, exports.isArray)(item)) {
        return item;
    }
    return [item];
};
exports.toArray = toArray;
function padStart(item, targetLength, padString = ' ') {
    const str = String(item);
    targetLength = targetLength >> 0;
    if (str.length > targetLength) {
        return String(str);
    }
    targetLength = targetLength - str.length;
    if (targetLength > padString.length) {
        padString += (0, exports.repeat)(padString, targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + String(str);
}
/**
 * Python like split
 */
const split = function (str, sep, num) {
    const splits = str.split(sep);
    return num
        ? splits.slice(0, num).concat([splits.slice(num).join(sep)])
        : splits;
};
exports.split = split;
/**
 * closure/goog/math/math.js:modulo
 * Copyright 2006 The Closure Library Authors.
 * The % operator in JavaScript returns the remainder of a / b, but differs from
 * some other languages in that the result will have the same sign as the
 * dividend. For example, -1 % 8 == -1, whereas in some other languages
 * (such as Python) the result would be 7. This function emulates the more
 * correct modulo behavior, which is useful for certain applications such as
 * calculating an offset index in a circular list.
 *
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @return {number} a % b where the result is between 0 and b (either 0 <= x < b
 * or b < x <= 0, depending on the sign of b).
 */
const pymod = function (a, b) {
    const r = a % b;
    // If r and b differ in sign, add b to wrap the result to the correct sign.
    return r * b < 0 ? r + b : r;
};
exports.pymod = pymod;
/**
 * @see: <http://docs.python.org/library/functions.html#divmod>
 */
const divmod = function (a, b) {
    return { div: Math.floor(a / b), mod: (0, exports.pymod)(a, b) };
};
exports.divmod = divmod;
const empty = function (obj) {
    return !(0, exports.isPresent)(obj) || obj.length === 0;
};
exports.empty = empty;
/**
 * Python-like boolean
 *
 * @return {Boolean} value of an object/primitive, taking into account
 * the fact that in Python an empty list's/tuple's
 * boolean value is False, whereas in JS it's true
 */
const notEmpty = function (obj) {
    return !(0, exports.empty)(obj);
};
exports.notEmpty = notEmpty;
/**
 * Return true if a value is in an array
 */
const includes = function (arr, val) {
    return (0, exports.notEmpty)(arr) && arr.indexOf(val) !== -1;
};
exports.includes = includes;
//# sourceMappingURL=helpers.js.map