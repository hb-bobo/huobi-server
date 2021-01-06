import dayjs from 'dayjs';

/**
 * 获取一段时间
 * @param {string} time 24h
 * @return {Date[]}
 */
export function getInterval(timeDesription: string) {
    const metchResult = timeDesription.match(/\d+/);
    const time: number = typeof metchResult === 'number' ? metchResult [0] : 24;
    let factor = 60 * 60 * 1000;
    if(timeDesription.includes('h')) {
        factor = 60 * 60 * 1000;
    }
    return [
        dayjs(Date.now() - (time * factor)).format("YYYY/MM/DD H:mm:ss"),
        dayjs().format("YYYY/MM/DD H:mm:ss")
    ]
}

