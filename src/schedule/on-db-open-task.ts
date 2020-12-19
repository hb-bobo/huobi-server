
import * as TradeAccountService from 'ROOT/module/trade-account/TradeAccount.service';
import * as WatchService from 'ROOT/module/watch/watch.service';
import { dbEvent } from "ROOT/db/orm";
import { ws_event } from 'ROOT/huobi/ws/events';
import { start as huobiWSStart } from 'ROOT/huobi/ws/ws';
import { start as huobiWSStartV2 } from 'ROOT/huobi/ws/ws.v2';
import { WS_REQ, WS_SUB } from 'ROOT/huobi/ws/ws.cmd';
import { redis, KEY_MAP } from 'ROOT/db/redis';
import { handle } from 'ROOT/huobi/huobi-handler';
import { SocketFrom } from 'ROOT/interface/ws';
import { outLogger } from 'ROOT/common/logger';

dbEvent.on('connected', start);
export let HUOBI_WS: ReturnType<typeof huobiWSStart>;
/**
 * 自动任务开始
 */
export async function start() {

    const account = await TradeAccountService.findOne({ auto_trade: 1 });
    outLogger.log(`start: ${JSON.stringify(account)}`);
    if (!account) {
        return;
    }
    const WatchEntityList = await WatchService.find();

    // redis.set(
    //     KEY_MAP['watch-symbol'],
    //     WatchEntityList.map((WatchEntity) => {
    //         return WatchEntity.symbol;
    //     })
    // );


    if (WatchEntityList.length > 0) {

        HUOBI_WS = huobiWSStart(account.access_key, account.secret_key);
        HUOBI_WS.on('open', () => {
            WatchEntityList.forEach((WatchEntity) => {
                const SYMBOL = WatchEntity.symbol.toLowerCase();
                HUOBI_WS.sub(WS_SUB.kline(SYMBOL, '1min'));
                // HUOBI_WS.sub(WS_SUB.marketDetail(SYMBOL));
                HUOBI_WS.sub(WS_SUB.depth(SYMBOL));
                HUOBI_WS.sub(WS_SUB.tradeDetail(SYMBOL));
            });
        })

        // HUOBI_WS.on('close', start);
    }
}

ws_event.on('huobi:ws:message', function (ev) {

    if (ev.from === SocketFrom.huobi) {
        handle(ev as any);
    }
});
