import url from 'url';
import { hbsdk_commom } from "ROOT/huobi/hbsdk";
import { writeFileSync } from 'fs';
import { join } from 'path';
import dayjs from 'dayjs';

const symbol = 'btcusdt';
const period = '5min';

hbsdk_commom
.getMarketHistoryKline({symbol: symbol, size: 200, period: period})
.then((data) => {
    writeFileSync(
        join(__dirname, `data/${symbol}-${period}-${dayjs().format("YYYY-MM-DD")}.json`),
        JSON.stringify(data)
    )
})