import { Analyser } from "./analyse"

interface Options {
    symbol: string;
    /**
     * 对币余额(usdt)
     */
    quoteCurrencyBalance: number;
    /**
     * 当前币的余额
     */
    baseCurrencyBalance: number;

    maxs: number[],
    mins: number[],
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
    analyser = new Analyser()
    /**
     * 量化交易
     */
    constructor(option: Options) {
        Object.assign(this.config, option);
    }
    use(...params: Parameters<Analyser['use']>) {
        return this.analyser.use(...params);
    }
    analysis(...params: Parameters<Analyser['analysis']>) {
        return this.analyser.analysis(...params);
    }
}
