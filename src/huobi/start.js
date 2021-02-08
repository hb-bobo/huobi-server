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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.trader = void 0;
const TradeAccountService = __importStar(require("../module/trade-account/TradeAccount.service"));
const WatchService = __importStar(require("../module/watch/watch.service"));
const AutoOrderConfigService = __importStar(require("../module/auto-order-config/AutoOrderConfig.service"));
const orm_1 = require("../db/orm");
const logger_1 = require("../common/logger");
const Trader_1 = require("./Trader");
const node_huobi_sdk_1 = require("node-huobi-sdk");
const huobi_1 = require("../constants/huobi");
const huobi_handler_1 = require("./huobi-handler");
const hbsdk_1 = require("./hbsdk");
orm_1.dbEvent.on('connected', start);
exports.trader = new Trader_1.Trader(hbsdk_1.hbsdk);
/**
 * 自动任务开始
 */
async function start() {
    const account = await TradeAccountService.findOne({ auto_trade: 1 });
    logger_1.outLogger.info(`start: ${account && account.auto_trade}`);
    if (!account) {
        return;
    }
    const autoOrderList = await AutoOrderConfigService.find({ userId: account.userId });
    hbsdk_1.hbsdk.setOptions({
        accessKey: account.access_key,
        secretKey: account.secret_key,
        errLogger: (...msg) => {
            logger_1.errLogger.error(...msg);
        },
        outLogger: (...msg) => {
            logger_1.outLogger.info(...msg);
        },
        url: {
            rest: huobi_1.REST_URL,
            market_ws: huobi_1.MARKET_WS,
            account_ws: huobi_1.ACCOUNT_WS,
        }
    });
    exports.trader.init();
    const WatchEntityList = await WatchService.find();
    logger_1.outLogger.info(`autoOrderList`, autoOrderList.length);
    if (autoOrderList.length > 0) {
        autoOrderList.forEach((autoOrderConfigEntity) => {
            exports.trader.autoTrader({
                symbol: autoOrderConfigEntity.symbol,
                buy_usdt: autoOrderConfigEntity.buy_usdt,
                sell_usdt: autoOrderConfigEntity.sell_usdt,
                period: autoOrderConfigEntity.period,
                oversoldRatio: autoOrderConfigEntity.oversoldRatio,
                overboughtRatio: autoOrderConfigEntity.overboughtRatio,
                sellAmountRatio: autoOrderConfigEntity.sellAmountRatio,
                buyAmountRatio: autoOrderConfigEntity.buyAmountRatio,
            }, autoOrderConfigEntity.userId);
        });
    }
    if (WatchEntityList.length > 0) {
        WatchEntityList.forEach((WatchEntity) => {
            const SYMBOL = WatchEntity.symbol.toLowerCase();
            hbsdk_1.hbsdk.subMarketDepth({ symbol: SYMBOL }, huobi_handler_1.handleDepth);
            hbsdk_1.hbsdk.subMarketKline({ symbol: SYMBOL, period: node_huobi_sdk_1.CandlestickIntervalEnum.MIN5 }, huobi_handler_1.handleKline);
            hbsdk_1.hbsdk.subMarketTrade({ symbol: SYMBOL }, huobi_handler_1.handleTrade);
        });
    }
}
exports.start = start;
