"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 加权定投，以主观最高位，最低位(中长期)增长型定投
 */
class DollarCostAvg {
    /**
     * 加权定投，以主观最高位，最低位(中长期)增长型定投
     * @param option
     */
    constructor(option) {
        /**
         * 你看涨的最大值
         * [1000, 2000]
         */
        this.maxs = [];
        /**
         * 你看空的最低值
         * [500, 200]
         */
        this.mins = [];
        /**
         * 当前价格
         */
        this.currentPrice = 0;
        /**
         * 将单子分割
         */
        this.splitBill = () => {
            // console.log('splitBill')
            const max = Math.max(...this.maxs);
            const min = Math.max(...this.mins);
            if (!this.option.balance) {
                return;
            }
            // 拿出一半封底/顶
            let canUse = this.option.balance / 1.6;
            const buyList = [
                {
                    volume: canUse / 2,
                    price: min,
                }
            ];
            const sellList = [
                {
                    volume: canUse / 2,
                    price: max,
                }
            ];
            while (canUse > this.option.minVolume * (1.6 * 2)) {
                canUse = canUse / 1.6;
                buyList.push({
                    volume: canUse / 2,
                });
                sellList.push({
                    volume: canUse / 2,
                });
            }
            const disPrice = ((max - min) / 2) / buyList.length;
            function mapPrice(arr, type) {
                return arr.forEach((item, index) => {
                    if (item.price !== undefined) {
                        return;
                    }
                    item.price = arr[index - 1].price + (disPrice * (type === 'sell' ? -1 : 1));
                });
            }
            mapPrice(buyList, 'buy');
            mapPrice(sellList, 'sell');
            this.buyList = buyList;
            this.sellList = sellList;
            return {
                buyList,
                sellList,
            };
        };
        this.option = option;
        this.init();
    }
    init() {
        this.maxs = this.option.maxs;
        this.mins = this.option.mins;
    }
    trade(close, action) {
        if (this.buyList === undefined || this.sellList === undefined) {
            this.splitBill();
        }
        if (!this.buyList) {
            return;
        }
        for (let i = 0; i < this.buyList.length; i++) {
            const element = this.buyList[i];
            if (close < element.price && !element.invalid) {
                if (this.buyList[i - 1] && close < this.buyList[i - 1].price) {
                    continue;
                }
                // console.log(element)
                this.buyList[i].invalid = true;
                this.sellList[i].invalid = false;
                return {
                    ...element,
                    action: 'buy'
                };
            }
        }
        for (let i = 0; i < this.sellList.length; i++) {
            const element = this.sellList[i];
            if (close > element.price && !element.invalid) {
                if (this.sellList[i - 1] && close > this.sellList[i - 1].price) {
                    continue;
                }
                element.invalid = true;
                this.buyList[i].invalid = false;
                return {
                    ...element,
                    action: 'sell'
                };
            }
        }
    }
    validList(list) {
        return list.some(item => !item.invalid);
    }
    updateConfig(config) {
        Object.assign(this.option, config);
        this.init();
        if (Number(this.option.balance) > 10 && !this.validList(this.buyList) && !this.validList(this.sellList)) {
            this.splitBill();
            console.log('更新');
        }
    }
}
exports.default = DollarCostAvg;
// const price = 9500
// const n = 10;
// const max = 11000;
// const balance = 100;
// // console.log((max - price) / )
// // Math.log2(r/start + 1)
// for (let index = 0; index < 3;) {
//     // console.log(1 * Math.pow(2, index));
//     console.log(Math.log2(index + 1))
//     index = index + 0.1;
// }d
