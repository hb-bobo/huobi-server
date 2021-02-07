

const MIN1 = 1000 * 60;
const HOUR1 = MIN1 * 60;

export declare type Period = "1min" | "5min" | "15min" | "30min" | "60min" | "1day" | "4hour";

export const IntervalEnum = {
    min: MIN1,
    hour: HOUR1,
    day: HOUR1 * 24
}

/**
 * 按一定时间合并数据
 * @param callback
 * @param interval
 */
export function mergeTime(callback: () => void, interval: Period) {
    const num = parseInt(interval);
    if (isNaN(num)) {
        throw Error('mergeTime 参数有误' + interval);
    }
    const unit = interval.replace(String(num), '');
    if (!IntervalEnum[unit]) {
        throw Error('mergeTime 单位有误' + interval);
    }
    const disTime = num * IntervalEnum[unit];
    let preInterval = Date.now();

    return function (datetime?: number | Date) {
        const currentInterval = datetime
            ? (typeof datetime === 'number' ? datetime : datetime.getTime())
            : Date.now();
        if (currentInterval - preInterval >= disTime) {
            callback();
            preInterval = currentInterval;
            return;
        }
    }
}
