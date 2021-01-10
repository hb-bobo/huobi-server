import { Analyser, DollarCostAvg } from "./analyse"

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
    minVolume?: number,
}

/**
 * 量化交易
 */
export default class Quant {
    config: Options = {} as Options;
    analyser = new Analyser();
    dc: DollarCostAvg;
    /**
     * 量化交易
     */
    constructor(option: Options) {
        Object.assign(this.config, option);

        if (option.maxs && option.mins && option.minVolume) {
            this.dc = new DollarCostAvg({
                maxs: option.maxs,
                mins: option.mins,
                minVolume: option.minVolume,
            });
            this.analyser.use((row) => {
                this.dc.updateConfig({balance: this.config.quoteCurrencyBalance / row.close});
                this.config.price = row.close;
            });
        }
    }
    /**
     * 安全交易
     * @param price 
     * @param action 
     */
    safeTrade(price: number, action?: 'buy' | 'sell') {
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
    mockUse(...params: Parameters<Analyser['use']>) {
        this.analyser.result.forEach((row) => {
            this.dc.updateConfig({
                balance: this.config.quoteCurrencyBalance / row.close,
            });
            this.config.price = row.close;
            params.forEach((callback) => callback(row as any))
        })
    }
}
