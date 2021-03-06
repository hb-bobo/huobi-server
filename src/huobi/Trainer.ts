
import { outLogger } from "ROOT/common/logger";
import { Quant } from "ROOT/lib/quant";
import Backtest from "ROOT/lib/quant/Backtest";
import { keepDecimalFixed } from "ROOT/utils";

export class Trainer {
    quant: Quant;
    buy_usdt = 10;
    sell_usdt = 10;
    constructor(quant: Quant, {buy_usdt, sell_usdt}) {
        this.quant = quant;
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
    async run(history: any[]) {
        const overRatio = await this.trainOverRatio(history).then(result => this.getTop(result));
        const amountRatio = this.trainAmountRatio(history).then(result => this.getTop(result));

        outLogger.info('Training complete:', this.quant.config.symbol, overRatio);
        const config: Record<string, any> = {
        }
        if (overRatio.return > 1) {
            Object.assign(config, overRatio);
        }
        // if (amountRatio.return > 1) {
        //     Object.assign(config, amountRatio);
        // }
        delete config.return;
        return config;
    }

    fit(fn, ) {
        setTimeout(fn, 0);
    }
    async trainOverRatio(history: any[]) {
        if (!history.length) {
            return [];
        }
        const { quoteCurrencyBalance, baseCurrencyBalance, minVolume} = this.getConfig();
        console.log({ quoteCurrencyBalance, baseCurrencyBalance, minVolume})
        const quant = new Quant({
            symbol: this.quant.config.symbol,
            price: history[history.length - 1].close,
            quoteCurrencyBalance: quoteCurrencyBalance,
            baseCurrencyBalance: baseCurrencyBalance,
            maxs: [history[history.length - 1].close * 1.04],
            mins: [history[history.length - 1].close * 0.96],
            minVolume: minVolume,
        });


        const result: ({
            oversoldRatio: number;
            overboughtRatio: number;
            return: number;
            buyCount: number;
            sellCount: number;
        })[] = [];
        const bt = new Backtest({
            symbol: quant.config.symbol,
            buyAmount: this.quant.config.minVolume * 50,
            sellAmount: this.quant.config.minVolume * 50,
            quoteCurrencyBalance: quant.config.quoteCurrencyBalance,
            baseCurrencyBalance: quant.config.baseCurrencyBalance,
        });
        quant.analysis(history);
        const matrax: number[][] = [];
        for (let oversoldRatio = -0.02; oversoldRatio < 0.1; oversoldRatio = oversoldRatio + 0.005) {
            for (let overboughtRatio = 0.02; overboughtRatio > -0.1; overboughtRatio = overboughtRatio - 0.005) {
                matrax.push([overboughtRatio, oversoldRatio]);
                // bt.reset();
                // quant.mockUse((row) => {

                //     if (!row.MA5  || !row.MA30 || !row.MA10  || !row.MA60) {
                //         return;
                //     }

                //     if (row["close/MA60"] > oversoldRatio) {

                //         bt.sell(row.close * 1.002, this.sell_usdt / row.close);
                //     }
                //     if (row["close/MA60"] < overboughtRatio) {

                //         bt.buy(row.close * 0.998, this.buy_usdt / row.close);
                //     }
                // });

                // result.push({
                //     oversoldRatio: keepDecimalFixed(oversoldRatio, 3),
                //     overboughtRatio: keepDecimalFixed(overboughtRatio, 3),
                //     return: bt.getReturn() * 100,
                //     buyCount: bt.buyCount,
                //     sellCount: bt.sellCount
                // });
            }
        }
        console.log(matrax.length)
        return result;
        // const sortedList = result.sort((a, b) => {
        //     return  b.return - a.return
        // });
        // return sortedList[0];
    }
    async trainAmountRatio(history: any[]) {

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

        const result: ({
            sell_changepercent: number;
            buy_changepercent: number;
            return: number;
            buyCount: number;
            sellCount: number;
        })[] = [];
        for (let sellAmountRatio = 0.6; sellAmountRatio < 6; sellAmountRatio = sellAmountRatio + 0.2) {
            for (let buyAmountRatio = -0.6; buyAmountRatio > -6; buyAmountRatio = buyAmountRatio - 0.2) {

                const bt = new Backtest({
                    symbol: quant.config.symbol,
                    buyAmount: this.quant.config.minVolume * 10,
                    sellAmount: this.quant.config.minVolume * 10,
                    quoteCurrencyBalance: quoteCurrencyBalance,
                    baseCurrencyBalance: baseCurrencyBalance,
                });
                let buyCount = 0;
                let sellCount = 0;
                quant.analyser.result = [];

                quant.use((row) => {
                    if (!row.MA5 || !row.MA60 || !row.MA30 || !row.MA10) {
                        return;
                    }

                   // 卖
                    if (row.close > row.MA30 && row.amplitude > sellAmountRatio) {
                        bt.sell(row.close, this.sell_usdt / row.close);
                        sellCount++;
                    }
                    // 买
                    if (row.close < row.MA30 && row.amplitude < buyAmountRatio) {
                        bt.buy(row.close, this.sell_usdt / row.close);
                        buyCount++;
                    }
                });
                quant.analysis(history);
                result.push({
                    sell_changepercent: keepDecimalFixed(sellAmountRatio, 3),
                    buy_changepercent: keepDecimalFixed(buyAmountRatio, 3),
                    return: bt.getReturn() * 100,
                    buyCount,
                    sellCount,
                });
            }
        }
        return result;
    }
}
