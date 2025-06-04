"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const iterresult_js_1 = __importDefault(require("./iterresult.js"));
const dateutil_js_1 = require("./dateutil.js");
const helpers_js_1 = require("./helpers.js");
function argsMatch(left, right) {
    if (Array.isArray(left)) {
        if (!Array.isArray(right))
            return false;
        if (left.length !== right.length)
            return false;
        return left.every((date, i) => date.getTime() === right[i].getTime());
    }
    if (left instanceof Date) {
        return right instanceof Date && left.getTime() === right.getTime();
    }
    return left === right;
}
class Cache {
    all = false;
    before = [];
    after = [];
    between = [];
    /**
     * @param {String} what - all/before/after/between
     * @param {Array,Date} value - an array of dates, one date, or null
     * @param {Object?} args - _iter arguments
     */
    _cacheAdd(what, value, args) {
        if (value) {
            value = value instanceof Date ? (0, dateutil_js_1.clone)(value) : (0, dateutil_js_1.cloneDates)(value);
        }
        if (what === 'all') {
            this.all = value;
        }
        else {
            args._value = value;
            this[what].push(args);
        }
    }
    /**
     * @return false - not in the cache
     * @return null  - cached, but zero occurrences (before/after)
     * @return Date  - cached (before/after)
     * @return []    - cached, but zero occurrences (all/between)
     * @return [Date1, DateN] - cached (all/between)
     */
    _cacheGet(what, args) {
        let cached = false;
        const argsKeys = args ? Object.keys(args) : [];
        const findCacheDiff = function (item) {
            for (let i = 0; i < argsKeys.length; i++) {
                const key = argsKeys[i];
                if (!argsMatch(args[key], item[key])) {
                    return true;
                }
            }
            return false;
        };
        const cachedObject = this[what];
        if (what === 'all') {
            cached = this.all;
        }
        else if ((0, helpers_js_1.isArray)(cachedObject)) {
            // Let's see whether we've already called the
            // 'what' method with the same 'args'
            for (let i = 0; i < cachedObject.length; i++) {
                const item = cachedObject[i];
                if (argsKeys.length && findCacheDiff(item))
                    continue;
                cached = item._value;
                break;
            }
        }
        if (!cached && this.all) {
            // Not in the cache, but we already know all the occurrences,
            // so we can find the correct dates from the cached ones.
            const iterResult = new iterresult_js_1.default(what, args);
            for (let i = 0; i < this.all.length; i++) {
                if (!iterResult.accept(this.all[i]))
                    break;
            }
            cached = iterResult.getValue();
            this._cacheAdd(what, cached, args);
        }
        return (0, helpers_js_1.isArray)(cached)
            ? (0, dateutil_js_1.cloneDates)(cached)
            : cached instanceof Date
                ? (0, dateutil_js_1.clone)(cached)
                : cached;
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map