"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTION = void 0;
exports.ACTION = {
    buy: '追涨',
    wait: '不动',
    sell: '杀跌',
    buyLow: '抄底',
    sellHigh: '高抛'
};
class Think {
    constructor() {
        this.status = exports.ACTION.wait;
        //
    }
}
