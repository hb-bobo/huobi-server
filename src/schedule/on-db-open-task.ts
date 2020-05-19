
import * as TradeAccountService from 'ROOT/module/trade-account/TradeAccount.service';
import * as WatchEntityService from 'ROOT/module/watch/watch.service';
import { dbEvent } from "ROOT/orm";
import { start as huobiWSStart} from 'ROOT/ws/huobi';
import { ws_req, ws_sub} from 'ROOT/ws/huobi.cmd';
/**
 * 自动任务开始
 */
export async function start() {

   const account = await TradeAccountService.findOne({auto_trade: 1});
   if (!account) {
       return;
   }
   const HUOBI_WS = huobiWSStart(account.secret_key);
   const symbols = await WatchEntityService.find({});
   symbols.forEach((symbol) => {
       const SYMBOL = symbol.symbol.toUpperCase();
       HUOBI_WS.json(ws_sub.kline(SYMBOL, '1min'));
       HUOBI_WS.json(ws_sub.marketDetail(SYMBOL));
       HUOBI_WS.json(ws_sub.tradeDetail(SYMBOL));
   });

}

dbEvent.on('connected', start);