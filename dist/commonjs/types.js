"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frequency = void 0;
exports.freqIsDailyOrGreater = freqIsDailyOrGreater;
var Frequency;
(function (Frequency) {
    Frequency[Frequency["YEARLY"] = 0] = "YEARLY";
    Frequency[Frequency["MONTHLY"] = 1] = "MONTHLY";
    Frequency[Frequency["WEEKLY"] = 2] = "WEEKLY";
    Frequency[Frequency["DAILY"] = 3] = "DAILY";
    Frequency[Frequency["HOURLY"] = 4] = "HOURLY";
    Frequency[Frequency["MINUTELY"] = 5] = "MINUTELY";
    Frequency[Frequency["SECONDLY"] = 6] = "SECONDLY";
})(Frequency || (exports.Frequency = Frequency = {}));
function freqIsDailyOrGreater(freq) {
    return freq < Frequency.HOURLY;
}
//# sourceMappingURL=types.js.map