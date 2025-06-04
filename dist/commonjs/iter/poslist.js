"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPoslist = buildPoslist;
const dateutil_js_1 = require("../dateutil.js");
const helpers_js_1 = require("../helpers.js");
function buildPoslist(bysetpos, timeset, start, end, ii, dayset) {
    const poslist = [];
    for (let j = 0; j < bysetpos.length; j++) {
        let daypos;
        let timepos;
        const pos = bysetpos[j];
        if (pos < 0) {
            daypos = Math.floor(pos / timeset.length);
            timepos = (0, helpers_js_1.pymod)(pos, timeset.length);
        }
        else {
            daypos = Math.floor((pos - 1) / timeset.length);
            timepos = (0, helpers_js_1.pymod)(pos - 1, timeset.length);
        }
        const tmp = [];
        for (let k = start; k < end; k++) {
            const val = dayset[k];
            if (!(0, helpers_js_1.isPresent)(val))
                continue;
            tmp.push(val);
        }
        let i;
        if (daypos < 0) {
            i = tmp.slice(daypos)[0];
        }
        else {
            i = tmp[daypos];
        }
        const time = timeset[timepos];
        const date = (0, dateutil_js_1.fromOrdinal)(ii.yearordinal + i);
        const res = (0, dateutil_js_1.combine)(date, time);
        // XXX: can this ever be in the array?
        // - compare the actual date instead?
        if (!(0, helpers_js_1.includes)(poslist, res))
            poslist.push(res);
    }
    (0, dateutil_js_1.sort)(poslist);
    return poslist;
}
//# sourceMappingURL=poslist.js.map