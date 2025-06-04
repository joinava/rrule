"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const iterresult_js_1 = __importDefault(require("./iterresult.js"));
/**
 * IterResult subclass that calls a callback function on each add,
 * and stops iterating when the callback returns false.
 */
class CallbackIterResult extends iterresult_js_1.default {
    iterator;
    constructor(method, args, iterator) {
        super(method, args);
        this.iterator = iterator;
    }
    add(date) {
        if (this.iterator(date, this._result.length)) {
            this._result.push(date);
            return true;
        }
        return false;
    }
}
exports.default = CallbackIterResult;
//# sourceMappingURL=callbackiterresult.js.map