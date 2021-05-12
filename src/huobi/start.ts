
import * as TradeAccountService from 'ROOT/module/trade-account/TradeAccount.service';
import * as WatchService from 'ROOT/module/watch/watch.service';
import * as AutoOrderConfigService from 'ROOT/module/auto-order-config/AutoOrderConfig.service';
import * as AutoContractOrderConfigService from 'ROOT/module/auto-order-contract-config/AutoOrderConfig.service';
import { dbEvent } from "ROOT/db/orm";
import { redis, KEY_MAP } from 'ROOT/db/redis';
import { errLogger, outLogger } from 'ROOT/common/logger';
import { Trader } from 'ROOT/huobi/Trader';
import { CandlestickIntervalEnum } from "node-huobi-sdk";
import { REST_URL, MARKET_WS, ACCOUNT_WS, CONTRACT_URL } from "ROOT/constants/huobi";
import { handleDepth, handleKline, handleTrade } from './huobi-handler';
import { hbsdk } from './hbsdk';

dbEvent.on('connected', start);

export const trader = new Trader(hbsdk);
/**
 * 自动任务开始
 */
export async function start() {
    const account = await TradeAccountService.findOne({ auto_trade: 1 });

    outLogger.info(`start: ${account && account.auto_trade}`);
    if (!account) {
        return;
    }
    const autoOrderList = await AutoOrderConfigService.find({userId: account.userId})
    const autoContractOrderList = await AutoContractOrderConfigService.find({userId: account.userId})

    hbsdk.setOptions({
        accessKey: account.access_key,
        secretKey: account.secret_key,
        errLogger: (...msg) => {
            errLogger.error(...msg);
        },
        outLogger: (...msg) => {
            outLogger.info(...msg);
        },
        url:{
            rest: REST_URL,
            market_ws: MARKET_WS,
            account_ws: ACCOUNT_WS,
            contract: CONTRACT_URL,
        }
    });
    trader.init();

    const WatchEntityList = await WatchService.find();

    outLogger.info(`autoOrderList`, autoOrderList.length)
    if (autoOrderList.length > 0) {
        autoOrderList.forEach((autoOrderConfigEntity) => {
            trader.autoTrader({
                symbol: autoOrderConfigEntity.symbol,
                buy_usdt: autoOrderConfigEntity.buy_usdt,
                sell_usdt: autoOrderConfigEntity.sell_usdt,
                period: autoOrderConfigEntity.period as any,
                oversoldRatio: autoOrderConfigEntity.oversoldRatio,
                overboughtRatio: autoOrderConfigEntity.overboughtRatio,
                sellAmountRatio: autoOrderConfigEntity.sellAmountRatio,
                buyAmountRatio: autoOrderConfigEntity.buyAmountRatio,
                contract: autoOrderConfigEntity.contract,
            }, autoOrderConfigEntity.userId)
        });
        // TODO 合约与现货合并
        // autoContractOrderList.forEach((autoOrderConfigEntity) => {
        //     trader.autoTrader({
        //         symbol: autoOrderConfigEntity.symbol,
        //         buy_open: autoOrderConfigEntity.buy_open,
        //         sell_close: autoOrderConfigEntity.sell_close,
        //         sell_open: autoOrderConfigEntity.sell_open,
        //         buy_close: autoOrderConfigEntity.buy_close,
        //         period: autoOrderConfigEntity.period as any,
        //         oversoldRatio: autoOrderConfigEntity.oversoldRatio,
        //         overboughtRatio: autoOrderConfigEntity.overboughtRatio,
        //         sellAmountRatio: autoOrderConfigEntity.sellAmountRatio,
        //         buyAmountRatio: autoOrderConfigEntity.buyAmountRatio,
        //         contract: autoOrderConfigEntity.contract,
        //     }, autoOrderConfigEntity.userId)
        // });
    }
    if (WatchEntityList.length > 0) {
        WatchEntityList.forEach((WatchEntity) => {
            const SYMBOL = WatchEntity.symbol.toLowerCase();
            hbsdk.subMarketDepth({symbol: SYMBOL}, handleDepth)
            hbsdk.subMarketKline({symbol: SYMBOL, period: CandlestickIntervalEnum.MIN5}, handleKline)
            hbsdk.subMarketTrade({symbol: SYMBOL}, handleTrade)
        });
    }
}
