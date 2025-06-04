import { dateInTimeZone, timeToUntilString } from './dateutil.js';
export class DateWithZone {
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
        const datestr = timeToUntilString(this.date.getTime(), this.isUTC);
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
        return dateInTimeZone(this.date, this.tzid);
    }
}
//# sourceMappingURL=datewithzone.js.map