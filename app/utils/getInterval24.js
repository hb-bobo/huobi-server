const moment = require('moment');
/**
 * 获取24小时内的数据
 * @return {Date[]}
 */
function getInterval24() {
    return [
        moment(Date.now() - (24 * 60 * 60 * 1000)).format("YYYY/MM/DD H:mm:ss"),
        moment().format("YYYY/MM/DD H:mm:ss")
    ]
}
module.exports = getInterval24;