"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toText = exports.parseText = exports.isFullyConvertible = exports.fromText = void 0;
const rrule_js_1 = require("../rrule.js");
const types_js_1 = require("../types.js");
const i18n_js_1 = __importDefault(require("./i18n.js"));
const parsetext_js_1 = __importDefault(require("./parsetext.js"));
exports.parseText = parsetext_js_1.default;
const totext_js_1 = __importDefault(require("./totext.js"));
/* !
 * rrule.js - Library for working with recurrence rules for calendar dates.
 * https://github.com/jakubroztocil/rrule
 *
 * Copyright 2010, Jakub Roztocil and Lars Schoning
 * Licenced under the BSD licence.
 * https://github.com/jakubroztocil/rrule/blob/master/LICENCE
 *
 */
/**
 *
 * Implementation of RRule.fromText() and RRule::toText().
 *
 *
 * On the client side, this file needs to be included
 * when those functions are used.
 *
 */
// =============================================================================
// fromText
// =============================================================================
/**
 * Will be able to convert some of the below described rules from
 * text format to a rule object.
 *
 *
 * RULES
 *
 * Every ([n])
 * day(s)
 * | [weekday], ..., (and) [weekday]
 * | weekday(s)
 * | week(s)
 * | month(s)
 * | [month], ..., (and) [month]
 * | year(s)
 *
 *
 * Plus 0, 1, or multiple of these:
 *
 * on [weekday], ..., (or) [weekday] the [monthday], [monthday], ... (or) [monthday]
 *
 * on [weekday], ..., (and) [weekday]
 *
 * on the [monthday], [monthday], ... (and) [monthday] (day of the month)
 *
 * on the [nth-weekday], ..., (and) [nth-weekday] (of the month/year)
 *
 *
 * Plus 0 or 1 of these:
 *
 * for [n] time(s)
 *
 * until [date]
 *
 * Plus (.)
 *
 *
 * Definitely no supported for parsing:
 *
 * (for year):
 * in week(s) [n], ..., (and) [n]
 *
 * on the [yearday], ..., (and) [n] day of the year
 * on day [yearday], ..., (and) [n]
 *
 *
 * NON-TERMINALS
 *
 * [n]: 1, 2 ..., one, two, three ..
 * [month]: January, February, March, April, May, ... December
 * [weekday]: Monday, ... Sunday
 * [nth-weekday]: first [weekday], 2nd [weekday], ... last [weekday], ...
 * [monthday]: first, 1., 2., 1st, 2nd, second, ... 31st, last day, 2nd last day, ..
 * [date]:
 * - [month] (0-31(,) ([year])),
 * - (the) 0-31.(1-12.([year])),
 * - (the) 0-31/(1-12/([year])),
 * - [weekday]
 *
 * [year]: 0000, 0001, ... 01, 02, ..
 *
 * Definitely not supported for parsing:
 *
 * [yearday]: first, 1., 2., 1st, 2nd, second, ... 366th, last day, 2nd last day, ..
 *
 * @param {String} text
 * @return {Object, Boolean} the rule, or null.
 */
const fromText = function (text, language = i18n_js_1.default) {
    return new rrule_js_1.RRule((0, parsetext_js_1.default)(text, language) || undefined);
};
exports.fromText = fromText;
const common = [
    'count',
    'until',
    'interval',
    'byweekday',
    'bymonthday',
    'bymonth',
];
totext_js_1.default.IMPLEMENTED = [];
totext_js_1.default.IMPLEMENTED[types_js_1.Frequency.HOURLY] = common;
totext_js_1.default.IMPLEMENTED[types_js_1.Frequency.MINUTELY] = common;
totext_js_1.default.IMPLEMENTED[types_js_1.Frequency.DAILY] = ['byhour'].concat(common);
totext_js_1.default.IMPLEMENTED[types_js_1.Frequency.WEEKLY] = common;
totext_js_1.default.IMPLEMENTED[types_js_1.Frequency.MONTHLY] = common;
totext_js_1.default.IMPLEMENTED[types_js_1.Frequency.YEARLY] = ['byweekno', 'byyearday'].concat(common);
// =============================================================================
// Export
// =============================================================================
const toText = function (rrule, gettext, language, dateFormatter) {
    return new totext_js_1.default(rrule, gettext, language, dateFormatter).toString();
};
exports.toText = toText;
const { isFullyConvertible } = totext_js_1.default;
exports.isFullyConvertible = isFullyConvertible;
//# sourceMappingURL=index.js.map