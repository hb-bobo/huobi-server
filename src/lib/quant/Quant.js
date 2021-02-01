"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analyse_1 = require("./analyse");
/**
 * 量化交易
 */
class Quant {
    /**
     * 量化交易
     */
    constructor(option = {}) {
        this.config = {};
        this.analyser = new analyse_1.Analyser({ maxResult: 800 });
        Object.assign(this.config, option);
        if (option.maxs && option.mins && option.maxs.length > 0 && option.minVolume) {
            this.dc = new analyse_1.DollarCostAvg({
                maxs: option.maxs,
                mins: option.mins,
                minVolume: option.minVolume,
            });
        }
        this.analyser.use((row) => {
            if (this.dc) {
                this.dc.updateConfig({ balance: this.config.quoteCurrencyBalance / row.close });
            }
            this.config.price = row.close;
        });
    }
    /**
     * 安全交易
     * @param price
     * @param action
     */
    safeTrade(price, action) {
        if (!this.dc) {
            const option = this.config;
            const maxs = option.maxs || [price * 1.1];
            const mins = option.mins || [price * 0.9];
            this.dc = new analyse_1.DollarCostAvg({
                maxs: maxs,
                mins: mins,
                minVolume: option.minVolume,
            });
        }
        return this.dc.trade(price, action);
    }
    updateConfig(newOption) {
        Object.assign(this.config, newOption);
    }
    use(...params) {
        return this.analyser.use(...params);
    }
    analysis(dataOrList) {
        return this.analyser.analysis(dataOrList);
    }
    mockUse(middleware) {
        this.analyser.result.forEach((row) => {
            this.dc.updateConfig({
                balance: this.config.quoteCurrencyBalance / row.close,
            });
            this.config.price = row.close;
            middleware(row);
        });
    }
}
exports.default = Quant;
