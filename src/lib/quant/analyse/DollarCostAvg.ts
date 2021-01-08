

interface Options {
    /**
     * 你看涨的最大值
     * [1000, 2000]
     */
    maxs: number[];
    /**
     * 你看空的最低值
     * [500, 200]
     */
    mins: number[];
    /**
     * 余额(对币的价格/当前价格)或者可用保证金
     */
    balance: number;
    /**
     * 最小下单
     */
    minVolume: number;
}
/**
 * 交易清单
 */
interface TradeItem {
    price: number;
    volume: number;
    /**
     * 是否失效
     */
    invalid?: boolean;
}
/**
 * 加权定投，以主观最高位，最低位(中长期)增长型定投
 */
export default class DollarCostAvg {
    /**
     * 你看涨的最大值
     * [1000, 2000]
     */
    public maxs: Options['maxs'] = [];
    /**
     * 你看空的最低值
     * [500, 200]
     */
    public mins: Options['mins'] = [];
    public option: Options;
    /**
     * 买单列表
     */
    public buyList: TradeItem[];
    /**
     * 卖单列表
     */
    public sellList: TradeItem[];
    /**
     * 当前价格
     */
    public currentPrice = 0;
    /**
     * 加权定投，以主观最高位，最低位(中长期)增长型定投
     * @param option
     */
    constructor(option: Options) {
        this.option = option;
        this.init();
    }
    public init() {
        this.maxs = this.option.maxs;
        this.mins = this.option.mins;
    }

    /**
     * 将单子分割
     */
    public splitBill = () => {
        const max = Math.max(...this.maxs);
        const min = Math.max(...this.mins);
        // 拿出一半封底/顶
        let canUse = this.option.balance / 1.8;
        const buyList: any[] = [
            {
                volume: canUse / 2,
                price: min,
            }
        ];
        const sellList: any[] = [
            {
                volume: canUse / 2,
                price: max,
            }
        ];

        while(canUse > this.option.minVolume * (1.8 * 2)) {
            canUse = canUse / 1.8;
            buyList.push({
                volume: canUse / 2,
            });
            sellList.push({
                volume: canUse / 2,
            });
        }
        const disPrice = ((max - min) / 2) / buyList.length;

        function mapPrice(arr:  any[], type: 'sell' | 'buy') {
            return arr.forEach((item, index) => {
                if (item.price !== undefined) {
                    return;
                }

                item.price = arr[index - 1].price + (disPrice * (type === 'sell' ? -1 : 1));
            })
        }
        mapPrice(buyList, 'buy');
        mapPrice(sellList, 'sell');
        this.buyList = buyList;
        this.sellList = sellList;
        return {
            buyList,
            sellList,
        }
    }

    public trade(close: number, action?: 'buy' | 'sell') {
        if (this.buyList === undefined || this.sellList === undefined) {
            this.splitBill();
        }
        for (let i = 0; i < this.buyList.length; i++) {
            const element = this.buyList[i];

            if (close < element.price && !element.invalid) {

                if (this.buyList[i - 1] && close < this.buyList[i - 1].price) {
                    continue;
                }
                element.invalid = true;
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
                return {
                    ...element,
                    action: 'sell'
                };
            }
        }
    }
    updateConfig(config: Partial<Options>) {
        Object.assign(this.option, config)
        this.init();
        this.splitBill();
    }
}

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