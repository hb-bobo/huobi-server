
import { outLogger } from "ROOT/common/logger";
import { HuobiSDK } from "node-huobi-sdk";
import { Quant } from "ROOT/lib/quant";
import Backtest from "ROOT/lib/quant/Backtest";
import { keepDecimalFixed } from "ROOT/utils";

export class Trainer {
    quant: Quant;
    sdk: HuobiSDK;
    constructor(quant: Quant, sdk: HuobiSDK) {
        this.quant = quant;
        this.sdk = sdk;
    }
    getTop(result: any[]) {
        const sortedList = result.sort((a, b) => {
            return  b.return - a.return
        });
        return sortedList[0];
    }
    /**
     * 训练
     */
    async run(history?: any[]) {
        const overRatio = await this.trainOverRatio(history).then(result => this.getTop(result));
        const amountRatio = await this.trainAmountRatio(history).then(result => this.getTop(result));

        outLogger.info('训练完成:', this.quant.config.symbol, overRatio, amountRatio);
        const config = {
            ...overRatio,
            ...amountRatio
        }
        if (overRatio.return > 10) {
            Object.assign(config, overRatio);
        }
        if (amountRatio.return > 10) {
            Object.assign(config, amountRatio);
        }
        delete config.return;
        return config;
    }
    async trainOverRatio(history?: any[]) {

        if (!history) {
            const data = await this.sdk.getMarketHistoryKline(this.quant.config.symbol, '5min', 1000);
            history = data ? data.reverse() : [];
        }
        if (!history.length) {
            return [];
        }
        const quant = new Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: (!this.quant.config.quoteCurrencyBalance || this.quant.config.quoteCurrencyBalance < 10) ? 600 : this.quant.config.quoteCurrencyBalance,
            baseCurrencyBalance: this.quant.config.baseCurrencyBalance || this.quant.config.minVolume * 100,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: this.quant.config.minVolume,
        });
        quant.analysis(history);
        const result: ({
            oversoldRatio: number;
            overboughtRatio: number;
            return: number
        })[] = [];
        for (let oversoldRatio = 0.01; oversoldRatio < 0.09; oversoldRatio = oversoldRatio + 0.002) {
            for (let overboughtRatio = -0.01; overboughtRatio > -0.09; overboughtRatio = overboughtRatio - 0.002) {

                const bt = new Backtest({
                    symbol: quant.config.symbol,
                    buyAmount: this.quant.config.minVolume * 10,
                    sellAmount: this.quant.config.minVolume * 10,
                    quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                    baseCurrencyBalance: quant.config.baseCurrencyBalance,
                });

                quant.mockUse(function (row) {
                    if (!row.MA5 || !row.MA60 || !row.MA30) {
                        return;
                    }
                    if (row["close/MA60"] > oversoldRatio && row.MA5 > row.MA30) {
                        bt.sell(row.close);
                    }
                    if (row["close/MA60"] < overboughtRatio && row.MA5 < row.MA30) {
                        bt.buy(row.close);
                    }
                });

                result.push({
                    oversoldRatio: keepDecimalFixed(oversoldRatio, 3),
                    overboughtRatio: keepDecimalFixed(overboughtRatio, 3),
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
    async trainAmountRatio(history?: any[]) {
        if (!history) {
            const data = await this.sdk.getMarketHistoryKline(this.quant.config.symbol, '5min', 1000);
            history = data.reverse();
        }
        const quant = new Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: (!this.quant.config.quoteCurrencyBalance || this.quant.config.quoteCurrencyBalance < 10) ? 600 : this.quant.config.quoteCurrencyBalance,
            baseCurrencyBalance: this.quant.config.baseCurrencyBalance || this.quant.config.minVolume * 100,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: this.quant.config.minVolume,
        });
        quant.analysis(history);
        const result: ({
            sellAmountRatio: number;
            buyAmountRatio: number;
            return: number
        })[] = [];
        for (let sellAmountRatio = 1; sellAmountRatio < 8; sellAmountRatio = sellAmountRatio + 0.1) {
            for (let buyAmountRatio = 1; buyAmountRatio < 8; buyAmountRatio = buyAmountRatio + 0.1) {

                const bt = new Backtest({
                    symbol: quant.config.symbol,
                    buyAmount: this.quant.config.minVolume * 10,
                    sellAmount: this.quant.config.minVolume * 10,
                    quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                    baseCurrencyBalance: quant.config.baseCurrencyBalance,
                });

                quant.mockUse(function (row) {
                    if (!row.MA5 || !row.MA60 || !row.MA30) {
                        return;
                    }
                   // 卖
                    if (row.close > row.MA30) {
                        if (row['amount/amountMA20'] > sellAmountRatio) {
                            bt.sell(row.close);
                        }
                    }
                    // 买
                    if (row.close < row.MA30) {
                        if (row['amount/amountMA20'] > buyAmountRatio) {
                            bt.buy(row.close);
                        }
                    }
                });

                result.push({
                    sellAmountRatio: keepDecimalFixed(sellAmountRatio, 3),
                    buyAmountRatio: keepDecimalFixed(buyAmountRatio, 3),
                    return: bt.getReturn() * 100,
                });
            }
        }
        return result;
    }
}
