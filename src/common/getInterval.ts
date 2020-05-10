import moment from 'moment';

/**
 * 获取一段时间
 * @return {Date[]}
 */
export function getInterval() {
    return [
        moment(Date.now() - (24 * 60 * 60 * 1000)).format("YYYY/MM/DD H:mm:ss"),
        moment().format("YYYY/MM/DD H:mm:ss")
    ]
}