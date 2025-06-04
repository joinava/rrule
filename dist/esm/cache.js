import IterResult from './iterresult.js';
import { clone, cloneDates } from './dateutil.js';
import { isArray } from './helpers.js';
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
export class Cache {
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
            value = value instanceof Date ? clone(value) : cloneDates(value);
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
        else if (isArray(cachedObject)) {
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
            const iterResult = new IterResult(what, args);
            for (let i = 0; i < this.all.length; i++) {
                if (!iterResult.accept(this.all[i]))
                    break;
            }
            cached = iterResult.getValue();
            this._cacheAdd(what, cached, args);
        }
        return isArray(cached)
            ? cloneDates(cached)
            : cached instanceof Date
                ? clone(cached)
                : cached;
    }
}
//# sourceMappingURL=cache.js.map