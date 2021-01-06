/**
 * 保留几位小数
 * @param value 待处理的数值
 * @param digits 保留位数
 */
export const keepDecimalFixed = (value: number | string, digits = 0) => {
    const unit = Math.pow(10, digits);
    return Math.trunc(Number(value) * unit) / unit;
};

const decimalZeroDigitsReg = /^-?(\d+)\.?([0]*)/;

/**
 * 根据小数有效值自动保留小数位数
 * @param value
 */
export function autoToFixed(value) {
    let digit = 4;
    value = typeof value === 'string' ? value : String(value);
    const match = value.match(decimalZeroDigitsReg)
    if (match !== null) {
        if (Number(match[1]) <= 0) {
            digit = match[2].length + digit;
        }
    }
    return keepDecimalFixed(value, digit);
}

