
import { outLogger } from "ROOT/common/logger";
import { HuobiSDK } from "node-huobi-sdk";
import { Quant } from "ROOT/lib/quant";
import Backtest from "ROOT/lib/quant/Backtest";
import { keepDecimalFixed } from "ROOT/utils";

export class Trainer {
    quant: Quant;
    sdk: HuobiSDK;
    buy_usdt = 10;
    sell_usdt = 10;
    constructor(quant: Quant, sdk: HuobiSDK, {buy_usdt, sell_usdt}) {
        this.quant = quant;
        this.sdk = sdk;
        this.buy_usdt = buy_usdt;
        this.sell_usdt = sell_usdt;
    }
    getTop(result: any[]) {
        const sortedList = result.sort((a, b) => {
            return  b.return - a.return
        });
        return sortedList[0];
    }
    getConfig() {
        const {quoteCurrencyBalance, baseCurrencyBalance, minVolume } = this.quant.config
        return {
            symbol: this.quant.config.symbol,
            quoteCurrencyBalance,
            baseCurrencyBalance,
            // quoteCurrencyBalance: (!quoteCurrencyBalance || quoteCurrencyBalance < 100) ? 600 : quoteCurrencyBalance,
            // baseCurrencyBalance: (!baseCurrencyBalance || baseCurrencyBalance < minVolume * 20) ? minVolume * 100 : baseCurrencyBalance,
            minVolume: minVolume,
        }
    }
    /**
     * 训练
     */
    async run(history?: any[]) {
        const overRatio = await this.trainOverRatio(history).then(result => this.getTop(result));
        const amountRatio = await this.trainAmountRatio(history).then(result => this.getTop(result));

        outLogger.info('Training complete:', this.quant.config.symbol, overRatio, amountRatio);
        const config: Record<string, any> = {
        }
        if (overRatio.return > 1) {
            Object.assign(config, overRatio);
        }
        if (amountRatio.return > 1) {
            Object.assign(config, amountRatio);
        }
        delete config.return;
        return config;
    }
    async trainOverRatio(history?: any[]) {

        if (!history) {
            const data = await this.sdk.getMarketHistoryKline(this.quant.config.symbol, '5min', 500);
            history = data ? data.reverse() : [];
        }
        if (!history.length) {
            return [];
        }
        const { quoteCurrencyBalance, baseCurrencyBalance, minVolume} = this.getConfig();
        const quant = new Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: quoteCurrencyBalance,
            baseCurrencyBalance: baseCurrencyBalance,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: minVolume,
        });

        quant.analysis(history);
        const result: ({
            oversoldRatio: number;
            overboughtRatio: number;
            return: number
        })[] = [];

        for (let oversoldRatio = 0.02; oversoldRatio < 0.1; oversoldRatio = oversoldRatio + 0.002) {
            for (let overboughtRatio = -0.02; overboughtRatio > -0.1; overboughtRatio = overboughtRatio - 0.002) {

                const bt = new Backtest({
                    symbol: quant.config.symbol,
                    buyAmount: this.quant.config.minVolume * 10,
                    sellAmount: this.quant.config.minVolume * 10,
                    quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
                    baseCurrencyBalance: quant.config.baseCurrencyBalance,
                });

                quant.mockUse((row) => {
                    if (!row.MA5 || !row.MA120 || !row.MA30 || !row.MA10) {
                        return;
                    }
                    if (row["close/MA120"] > oversoldRatio) {
                        bt.sell(row.close, this.sell_usdt / row.close);
                    }
                    if (row["close/MA120"] < overboughtRatio) {
                        bt.buy(row.close, this.buy_usdt / row.close);
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
            const data = await this.sdk.getMarketHistoryKline(this.quant.config.symbol, '5min', 500);
            history = data.reverse();
        }
        const { quoteCurrencyBalance, baseCurrencyBalance, minVolume} = this.getConfig();
        const quant = new Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: quoteCurrencyBalance,
            baseCurrencyBalance: baseCurrencyBalance,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: minVolume,
        });
        quant.analysis(history);
        const result: ({
            sellAmountRatio: number;
            buyAmountRatio: number;
            return: number
        })[] = [];
        for (let sellAmountRatio = 0.5; sellAmountRatio < 10; sellAmountRatio = sellAmountRatio + 0.2) {
            for (let buyAmountRatio = 0.5; buyAmountRatio < 10; buyAmountRatio = buyAmountRatio + 0.2) {

                const bt = new Backtest({
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
                   // 卖
                    if (row.MA10 > row.MA60 && row.changepercent > sellAmountRatio) {
                        bt.sell(row.close, this.sell_usdt / row.close);
                    }
                    // 买
                    if (row.MA10 < row.MA60 && row.changepercent > buyAmountRatio) {
                        bt.buy(row.close, this.sell_usdt / row.close);
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
