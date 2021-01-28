"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trainer = void 0;
const logger_1 = require("../common/logger");
const quant_1 = require("../lib/quant");
const Backtest_1 = __importDefault(require("../lib/quant/Backtest"));
const utils_1 = require("../utils");
class Trainer {
    constructor(quant, sdk, { buy_usdt, sell_usdt }) {
        this.buy_usdt = 10;
        this.sell_usdt = 10;
        this.quant = quant;
        this.sdk = sdk;
        this.buy_usdt = buy_usdt;
        this.sell_usdt = sell_usdt;
    }
    getTop(result) {
        const sortedList = result.sort((a, b) => {
            return b.return - a.return;
        });
        return sortedList[0];
    }
    getConfig() {
        const { quoteCurrencyBalance, baseCurrencyBalance, minVolume } = this.quant.config;
        return {
            symbol: this.quant.config.symbol,
            quoteCurrencyBalance: (!quoteCurrencyBalance || quoteCurrencyBalance < 100) ? 600 : quoteCurrencyBalance,
            baseCurrencyBalance: (!baseCurrencyBalance || baseCurrencyBalance < minVolume * 50) ? minVolume * 100 : baseCurrencyBalance,
            minVolume: minVolume,
        };
    }
    /**
     * 训练
     */
    async run(history) {
        const overRatio = await this.trainOverRatio(history).then(result => this.getTop(result));
        const amountRatio = await this.trainAmountRatio(history).then(result => this.getTop(result));
        logger_1.outLogger.info('Training complete:', this.quant.config.symbol, overRatio, amountRatio);
        const config = {};
        if (overRatio.return > 1) {
            Object.assign(config, overRatio);
        }
        if (amountRatio.return > 1) {
            Object.assign(config, amountRatio);
        }
        delete config.return;
        return config;
    }
    async trainOverRatio(history) {
        if (!history) {
            const data = await this.sdk.getMarketHistoryKline(this.quant.config.symbol, '5min', 500);
            history = data ? data.reverse() : [];
        }
        if (!history.length) {
            return [];
        }
        const { quoteCurrencyBalance, baseCurrencyBalance, minVolume } = this.getConfig();
        const quant = new quant_1.Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: quoteCurrencyBalance,
            baseCurrencyBalance: baseCurrencyBalance,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: minVolume,
        });
        quant.analysis(history);
        const result = [];
        for (let oversoldRatio = 0.01; oversoldRatio < 0.09; oversoldRatio = oversoldRatio + 0.002) {
            for (let overboughtRatio = -0.01; overboughtRatio > -0.09; overboughtRatio = overboughtRatio - 0.002) {
                const bt = new Backtest_1.default({
                    symbol: quant.config.symbol,
                    buyAmount: this.quant.config.minVolume * 10,
                    sellAmount: this.quant.config.minVolume * 10,
                    quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                    baseCurrencyBalance: quant.config.baseCurrencyBalance,
                });
                quant.mockUse((row) => {
                    if (!row.MA5 || !row.MA60 || !row.MA30 || !row.MA10) {
                        return;
                    }
                    if (row["close/MA60"] > oversoldRatio) {
                        bt.sell(row.close, this.sell_usdt / row.close);
                    }
                    if (row["close/MA60"] < overboughtRatio) {
                        bt.buy(row.close, this.buy_usdt / row.close);
                    }
                });
                result.push({
                    oversoldRatio: utils_1.keepDecimalFixed(oversoldRatio, 3),
                    overboughtRatio: utils_1.keepDecimalFixed(overboughtRatio, 3),
                    return: bt.getReturn() * 100,
                });
            }
        }
        return result;
        // const sortedList = result.sort((a, b) => {
        //     return  b.return - a.return
        // });
        // return sortedList[0];
    }
    async trainAmountRatio(history) {
        if (!history) {
            const data = await this.sdk.getMarketHistoryKline(this.quant.config.symbol, '5min', 500);
            history = data.reverse();
        }
        const { quoteCurrencyBalance, baseCurrencyBalance, minVolume } = this.getConfig();
        const quant = new quant_1.Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: quoteCurrencyBalance,
            baseCurrencyBalance: baseCurrencyBalance,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: minVolume,
        });
        quant.analysis(history);
        const result = [];
        for (let sellAmountRatio = 1; sellAmountRatio < 8; sellAmountRatio = sellAmountRatio + 0.1) {
            for (let buyAmountRatio = 1; buyAmountRatio < 8; buyAmountRatio = buyAmountRatio + 0.1) {
                const bt = new Backtest_1.default({
                    symbol: quant.config.symbol,
                    buyAmount: this.quant.config.minVolume * 10,
                    sellAmount: this.quant.config.minVolume * 10,
                    quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                    baseCurrencyBalance: quant.config.baseCurrencyBalance,
                });
                quant.mockUse(function (row) {
                    if (!row.MA5 || !row.MA60 || !row.MA30 || !row.MA10) {
                        return;
                    }
                    // 卖
                    if (row.close > row.MA60) {
                        if (row['amount/amountMA20'] > sellAmountRatio) {
                            bt.sell(row.close, this.sell_usdt / row.close);
                        }
                    }
                    // 买
                    if (row.close < row.MA60) {
                        if (row['amount/amountMA20'] > buyAmountRatio) {
                            bt.buy(row.close, this.sell_usdt / row.close);
                        }
                    }
                });
                result.push({
                    sellAmountRatio: utils_1.keepDecimalFixed(sellAmountRatio, 3),
                    buyAmountRatio: utils_1.keepDecimalFixed(buyAmountRatio, 3),
                    return: bt.getReturn() * 100,
                });
            }
        }
        return result;
    }
}
exports.Trainer = Trainer;
