
import * as TradeAccountService from 'ROOT/module/trade-account/TradeAccount.service';
import * as WatchEntityService from 'ROOT/module/watch/watch.service';
import { dbEvent } from "ROOT/db/orm";
import { ws_event } from 'ROOT/ws/events';
import { start as huobiWSStart } from 'ROOT/ws/huobi';
import { WS_REQ, WS_SUB } from 'ROOT/ws/huobi.cmd';
import { redis } from 'ROOT/db/redis';
// import { handle } from './huobi-handler';

/**
 * 自动任务开始
 */
export async function start() {

    const account = await TradeAccountService.findOne({ auto_trade: 1 });
    console.log(account)
    if (!account) {
        return;
    }
    const HUOBI_WS = huobiWSStart(account.secret_key);
    const symbols = await WatchEntityService.find({});
    symbols.forEach((symbol) => {
        HUOBI_WS.json(WS_SUB.kline('BTCUSDT', '1min'))
        const SYMBOL = symbol.symbol.toUpperCase();
        HUOBI_WS.json(WS_SUB.kline(SYMBOL, '1min'));
        HUOBI_WS.json(WS_SUB.marketDetail(SYMBOL));
        HUOBI_WS.json(WS_SUB.tradeDetail(SYMBOL));
    });
}

dbEvent.on('connected', start);



ws_event.on('huobi:ws:message', function (ev) {
    console.log(ev);
    // handle(ev.data)
});