
import * as TradeAccountService from 'ROOT/module/trade-account/TradeAccount.service';
import * as WatchService from 'ROOT/module/watch/watch.service';
import { dbEvent } from "ROOT/db/orm";
import { ws_event } from 'ROOT/huobi/ws/events';
import { start as huobiWSStart, ws as HUOBI_WS } from 'ROOT/huobi/ws/ws';
import { start as huobiWSStartV2 } from 'ROOT/huobi/ws/ws.v2';
import { WS_REQ, WS_SUB } from 'ROOT/huobi/ws/ws.cmd';
import { redis, KEY_MAP } from 'ROOT/db/redis';
import { handle } from 'ROOT/huobi/huobi-handler';
import { SocketFrom } from 'ROOT/interface/ws';
import { outLogger } from 'ROOT/common/logger';
import { omit } from 'lodash';

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
    const WatchEntityList = await WatchService.find();

    // redis.set(
    //     KEY_MAP['watch-symbol'],
    //     WatchEntityList.map((WatchEntity) => {
    //         return WatchEntity.symbol;
    //     })
    // );


    if (WatchEntityList.length > 0) {

        const ws = huobiWSStart(account.access_key, account.secret_key);
        ws.on('open', () => {
            WatchEntityList.forEach((WatchEntity) => {
                const SYMBOL = WatchEntity.symbol.toLowerCase();
                ws.sub(WS_SUB.kline(SYMBOL, '1min'));
                // HUOBI_WS.sub(WS_SUB.marketDetail(SYMBOL));
                ws.sub(WS_SUB.depth(SYMBOL));
                ws.sub(WS_SUB.tradeDetail(SYMBOL));
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
