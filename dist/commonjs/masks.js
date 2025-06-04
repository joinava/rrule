"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NMDAY366MASK = exports.NMDAY365MASK = exports.MDAY366MASK = exports.MDAY365MASK = exports.M366RANGE = exports.M366MASK = exports.M365RANGE = exports.M365MASK = exports.WDAYMASK = void 0;
const helpers_js_1 = require("./helpers.js");
// =============================================================================
// Date masks
// =============================================================================
// Every mask is 7 days longer to handle cross-year weekly periods.
const M365MASK = [
    ...(0, helpers_js_1.repeat)(1, 31),
    ...(0, helpers_js_1.repeat)(2, 28),
    ...(0, helpers_js_1.repeat)(3, 31),
    ...(0, helpers_js_1.repeat)(4, 30),
    ...(0, helpers_js_1.repeat)(5, 31),
    ...(0, helpers_js_1.repeat)(6, 30),
    ...(0, helpers_js_1.repeat)(7, 31),
    ...(0, helpers_js_1.repeat)(8, 31),
    ...(0, helpers_js_1.repeat)(9, 30),
    ...(0, helpers_js_1.repeat)(10, 31),
    ...(0, helpers_js_1.repeat)(11, 30),
    ...(0, helpers_js_1.repeat)(12, 31),
    ...(0, helpers_js_1.repeat)(1, 7),
];
exports.M365MASK = M365MASK;
const M366MASK = [
    ...(0, helpers_js_1.repeat)(1, 31),
    ...(0, helpers_js_1.repeat)(2, 29),
    ...(0, helpers_js_1.repeat)(3, 31),
    ...(0, helpers_js_1.repeat)(4, 30),
    ...(0, helpers_js_1.repeat)(5, 31),
    ...(0, helpers_js_1.repeat)(6, 30),
    ...(0, helpers_js_1.repeat)(7, 31),
    ...(0, helpers_js_1.repeat)(8, 31),
    ...(0, helpers_js_1.repeat)(9, 30),
    ...(0, helpers_js_1.repeat)(10, 31),
    ...(0, helpers_js_1.repeat)(11, 30),
    ...(0, helpers_js_1.repeat)(12, 31),
    ...(0, helpers_js_1.repeat)(1, 7),
];
exports.M366MASK = M366MASK;
const M28 = (0, helpers_js_1.range)(1, 29);
const M29 = (0, helpers_js_1.range)(1, 30);
const M30 = (0, helpers_js_1.range)(1, 31);
const M31 = (0, helpers_js_1.range)(1, 32);
const MDAY366MASK = [
    ...M31,
    ...M29,
    ...M31,
    ...M30,
    ...M31,
    ...M30,
    ...M31,
    ...M31,
    ...M30,
    ...M31,
    ...M30,
    ...M31,
    ...M31.slice(0, 7),
];
exports.MDAY366MASK = MDAY366MASK;
const MDAY365MASK = [
    ...M31,
    ...M28,
    ...M31,
    ...M30,
    ...M31,
    ...M30,
    ...M31,
    ...M31,
    ...M30,
    ...M31,
    ...M30,
    ...M31,
    ...M31.slice(0, 7),
];
exports.MDAY365MASK = MDAY365MASK;
const NM28 = (0, helpers_js_1.range)(-28, 0);
const NM29 = (0, helpers_js_1.range)(-29, 0);
const NM30 = (0, helpers_js_1.range)(-30, 0);
const NM31 = (0, helpers_js_1.range)(-31, 0);
const NMDAY366MASK = [
    ...NM31,
    ...NM29,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM31.slice(0, 7),
];
exports.NMDAY366MASK = NMDAY366MASK;
const NMDAY365MASK = [
    ...NM31,
    ...NM28,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM30,
    ...NM31,
    ...NM31.slice(0, 7),
];
exports.NMDAY365MASK = NMDAY365MASK;
const M366RANGE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
exports.M366RANGE = M366RANGE;
const M365RANGE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
exports.M365RANGE = M365RANGE;
const WDAYMASK = (function () {
    let wdaymask = [];
    for (let i = 0; i < 55; i++)
        wdaymask = wdaymask.concat((0, helpers_js_1.range)(7));
    return wdaymask;
})();
exports.WDAYMASK = WDAYMASK;
//# sourceMappingURL=masks.js.map