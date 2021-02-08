"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTime = exports.IntervalEnum = void 0;
const MIN1 = 1000 * 60;
const HOUR1 = MIN1 * 60;
exports.IntervalEnum = {
    min: MIN1,
    hour: HOUR1,
    day: HOUR1 * 24
};
/**
 * 按一定时间合并数据
 * @param callback
 * @param interval
 */
function mergeTime(callback, interval) {
    const num = parseInt(interval);
    if (isNaN(num)) {
        throw Error('mergeTime 参数有误' + interval);
    }
    const unit = interval.replace(String(num), '');
    if (!exports.IntervalEnum[unit]) {
        throw Error('mergeTime 单位有误' + interval);
    }
    const disTime = num * exports.IntervalEnum[unit];
    let preInterval = Date.now();
    return function (datetime) {
        const currentInterval = datetime
            ? (typeof datetime === 'number' ? datetime : datetime.getTime())
            : Date.now();
        if (currentInterval - preInterval >= disTime) {
            callback();
            preInterval = currentInterval;
            return;
        }
    };
}
exports.mergeTime = mergeTime;
