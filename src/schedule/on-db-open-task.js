"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const TradeAccountService = __importStar(require("../module/trade-account/TradeAccount.service"));
const WatchService = __importStar(require("../module/watch/watch.service"));
const orm_1 = require("../db/orm");
const events_1 = require("../huobi/ws/events");
const ws_1 = require("../huobi/ws/ws");
const ws_cmd_1 = require("../huobi/ws/ws.cmd");
const huobi_handler_1 = require("../huobi/huobi-handler");
const ws_2 = require("../interface/ws");
const logger_1 = require("../common/logger");
orm_1.dbEvent.on('connected', start);
/**
 * 自动任务开始
 */
async function start() {
    const account = await TradeAccountService.findOne({ auto_trade: 1 });
    logger_1.outLogger.info(`start: ${JSON.stringify(account)}`);
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
        const ws = ws_1.start(account.access_key, account.secret_key);
        ws.on('open', () => {
            WatchEntityList.forEach((WatchEntity) => {
                const SYMBOL = WatchEntity.symbol.toLowerCase();
                ws.sub(ws_cmd_1.WS_SUB.kline(SYMBOL, '1min'));
                // HUOBI_WS.sub(WS_SUB.marketDetail(SYMBOL));
                ws.sub(ws_cmd_1.WS_SUB.depth(SYMBOL));
                ws.sub(ws_cmd_1.WS_SUB.tradeDetail(SYMBOL));
            });
        });
        // HUOBI_WS.on('close', start);
    }
}
exports.start = start;
events_1.ws_event.on('huobi:ws:message', function (ev) {
    if (ev.from === ws_2.SocketFrom.huobi) {
        huobi_handler_1.handle(ev);
    }
});
