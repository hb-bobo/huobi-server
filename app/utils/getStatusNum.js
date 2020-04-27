
/**
 * 获取状态出现的个数
 * @param {Arrar<Object>} status
 * @return {Object}
 */
function getStatusNum(status) {
    if (!Array.isArray(status)) {
        console.error('status not Array');
        return;
    }
    // 状态出现的个数
    let res = {
        '横盘': 0,
        '涨': 0,
        '跌': 0,
    }
    status.forEach(item => {
        if (item.status === '横盘') {
            res['横盘']++;
        } else if(item.status === '涨') {
            res['涨']++;
        } else if(item.status === '跌') {
            res['跌']++;
        }
    });
    return res;
}
module.exports = getStatusNum;