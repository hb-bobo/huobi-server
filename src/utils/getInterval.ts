import moment from 'moment';

/**
 * 获取一段时间
 * @param {string} time 24h
 * @return {Date[]}
 */
export function getInterval(timeDesription: string) {
    const time = timeDesription.match(/\d+/) || 24;
    let factor = 60 * 60 * 1000;
    if(timeDesription.includes('h')) {
        factor = 60 * 60 * 1000;
    }
    return [
        moment(Date.now() - (time * factor)).format("YYYY/MM/DD H:mm:ss"),
        moment().format("YYYY/MM/DD H:mm:ss")
    ]
}

