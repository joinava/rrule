"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateWithZone = void 0;
const dateutil_js_1 = require("./dateutil.js");
class DateWithZone {
    date;
    tzid;
    constructor(date, tzid) {
        if (isNaN(date.getTime())) {
            throw new RangeError('Invalid date passed to DateWithZone');
        }
        this.date = date;
        this.tzid = tzid;
    }
    get isUTC() {
        return !this.tzid || this.tzid.toUpperCase() === 'UTC';
    }
    toString() {
        const datestr = (0, dateutil_js_1.timeToUntilString)(this.date.getTime(), this.isUTC);
        if (!this.isUTC) {
            return `;TZID=${this.tzid}:${datestr}`;
        }
        return `:${datestr}`;
    }
    getTime() {
        return this.date.getTime();
    }
    rezonedDate() {
        if (this.isUTC) {
            return this.date;
        }
        return (0, dateutil_js_1.dateInTimeZone)(this.date, this.tzid);
    }
}
exports.DateWithZone = DateWithZone;
//# sourceMappingURL=datewithzone.js.map