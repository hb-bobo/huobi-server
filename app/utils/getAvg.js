/**
 * 获取平均数
 * @param {number[]} arr
 * @return {number} 
 */
function getAvg(arr) {
    let sum = arr.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue));
    return sum / arr.length;
}
module.exports = getAvg;