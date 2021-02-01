"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoToFixed = exports.keepDecimalFixed = void 0;
const lodash_1 = require("lodash");
/**
 * 保留几位小数
 * @param value 待处理的数值
 * @param digits 保留位数
 */
const keepDecimalFixed = (value, digits = 2) => {
    const unit = Math.pow(10, digits);
    const val = typeof value === 'number' ? value : lodash_1.toNumber(value);
    return Math.trunc(val * unit) / unit;
};
exports.keepDecimalFixed = keepDecimalFixed;
const decimalZeroDigitsReg = /^-?(\d+)\.?([0]*)/;
/**
 * 根据小数有效值自动保留小数位数
 * @param value
 */
function autoToFixed(value, digit = 4) {
    value = typeof value === 'string' ? value : String(value);
    const match = value.match(decimalZeroDigitsReg);
    if (match !== null) {
        if (Number(match[1]) <= 0) {
            digit = match[2].length + digit;
        }
    }
    return exports.keepDecimalFixed(value, digit);
}
exports.autoToFixed = autoToFixed;
