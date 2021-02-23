import { Analyser, DollarCostAvg } from "./analyse";
import { AnalyserDataItem } from './analyse/Analyser';

interface Options {
    symbol: string;
    price?: number;
    /**
     * 对币余额(usdt)
     */
    quoteCurrencyBalance: number;
    /**
     * 当前币的余额
     */
    baseCurrencyBalance: number;

    maxs?: number[],
    mins?: number[],
    /**
     * 最小交易单位
     */
    minVolume: number,
}

/**
 * 量化交易
 */
export default class Quant {
    config: Options = {} as Options;
    analyser = new Analyser({maxResult: 800});
    dc: DollarCostAvg;
    /**
     * 量化交易
     */
    constructor(option = {} as Options) {

        Object.assign(this.config, option);

        if (option.maxs && option.mins && option.maxs.length > 0 && option.minVolume) {
            this.dc = new DollarCostAvg({
                maxs: option.maxs,
                mins: option.mins,
                minVolume: option.minVolume,
            });
        }
        this.analyser.use((row) => {
            if (this.dc) {

                let max = 0;
                let min = 0
                this.analyser.result.forEach((item) => {
                    if (item.close > max) { max = item.close }
                    if (item.low < min) { min = item.low }
                })
                this.dc.updateConfig({balance: this.config.quoteCurrencyBalance / row.close, mins: [min], maxs: [max]});
            }
            this.config.price = row.close;
        });
    }
    /**
     * 安全交易
     * @param price
     * @param action
     */
    safeTrade(price: number, action?: 'buy' | 'sell') {

        if (!this.dc) {
            const option = this.config;
            const maxs = option.maxs || [price * 1.1];
            const mins = option.mins || [price * 0.9];
            this.dc = new DollarCostAvg({
                maxs: maxs,
                mins: mins,
                minVolume: option.minVolume,
            });
        }
        return this.dc.trade(price, action);
    }

    updateConfig(newOption: Partial<Options>) {
        Object.assign(this.config, newOption);
    }
    use(...params: Parameters<Analyser['use']>) {
        return this.analyser.use(...params);
    }
    analysis<T extends Record<string, any>>(dataOrList: T) {
        return this.analyser.analysis(dataOrList);
    }
    mockUse(middleware: (row: AnalyserDataItem) => void) {
        this.analyser.result.forEach((row) => {
            this.dc.updateConfig({
                balance: this.config.quoteCurrencyBalance / row.close,
            });
            this.config.price = row.close;
            middleware(row as any)
        })
    }
}
