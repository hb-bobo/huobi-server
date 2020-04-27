/**
 * 获取涨跌幅
 * @param {number} oldPrice
 * @param {number} newPrice
 */
function getGain(oldPrice, newPrice) {
    return (newPrice - Number(oldPrice)) / oldPrice;
}

module.exports = getGain;