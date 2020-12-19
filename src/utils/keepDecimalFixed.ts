/**
 * 保留几位小数
 * @param value 待处理的数值
 * @param digits 保留位数
 */
const keepDecimalFixed = (value: number | string, digits = 0) => {
    const unit = Math.pow(10, digits);
    return Math.trunc(Number(value) * unit) / unit;
};
export default keepDecimalFixed;
