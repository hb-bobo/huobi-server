
import * as TradeAccountService from 'ROOT/module/trade-account/TradeAccount.service';
import * as WatchService from 'ROOT/module/watch/watch.service';
import { dbEvent } from "ROOT/db/orm";
import { redis, KEY_MAP } from 'ROOT/db/redis';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { Trader } from 'ROOT/huobi/Trader';
import { CandlestickIntervalEnum } from "ROOT/lib/huobi";
import { REST_URL, MARKET_WS, ACCOUNT_WS } from "ROOT/constants/huobi";
import { handleDepth, handleKline, handleTrade } from './huobi-handler';
import { hbsdk } from './hbsdk';

dbEvent.on('connected', start);

/**
 * 自动任务开始
 */
export async function start() {
    const account = await TradeAccountService.findOne({ auto_trade: 1 });
    outLogger.info(`start: ${account && account.auto_trade}`);
    if (!account) {
        return;
    }

    hbsdk.setOptions({
        accessKey: account.access_key,
        secretKey: account.secret_key,
        // errLogger: (msg) => {
        //     errLogger.error(msg);
        // },
        // outLogger: (msg) => {
        //     outLogger.info(msg);
        // },
        url:{
            rest: REST_URL,
            market_ws: MARKET_WS,
            account_ws: ACCOUNT_WS,
        }
    })
    const trader = new Trader(hbsdk);
    await hbsdk.getAccountId();
    const WatchEntityList = await WatchService.find();

    // redis.set(
    //     KEY_MAP['watch-symbol'],
    //     WatchEntityList.map((WatchEntity) => {
    //         return WatchEntity.symbol;
    //     })
    // );


    if (WatchEntityList.length > 0) {
        WatchEntityList.forEach((WatchEntity) => {
            const SYMBOL = WatchEntity.symbol.toLowerCase();
            hbsdk.subMarketDepth({symbol: SYMBOL}, handleDepth)
            hbsdk.subMarketKline({symbol: SYMBOL, period: CandlestickIntervalEnum.MIN1}, handleKline)
            hbsdk.subMarketTrade({symbol: SYMBOL}, handleTrade)
        });
    }
}
