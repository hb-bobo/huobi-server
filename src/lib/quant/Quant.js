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
    constructor(option) {
        this.config = {};
        this.analyser = new analyse_1.Analyser();
        Object.assign(this.config, option);
    }
    use(...params) {
        return this.analyser.use(...params);
    }
    analysis(...params) {
        return this.analyser.analysis(...params);
    }
}
exports.default = Quant;
