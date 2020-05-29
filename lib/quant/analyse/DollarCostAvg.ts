

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
}

/**
 * 加权定投，以主观最高位，最低位(中长期)增长型定投
 */
class DollarCostAvg {
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
     * 当前价格
     */
    public currentPrice: number = 0;
    constructor(option: Options) {
        this.option = option;
        this.init();
    }
    public init() {
        this.maxs = [];
        this.mins = [];
    }
    
}

const price = 9500
const n = 10;
const max = 11000;

const balance = 100;
// console.log((max - price) / )
// Math.log2(r/start + 1)

for (let index = 0; index < 3;) {
    // console.log(1 * Math.pow(2, index));
    console.log(Math.log2(index + 1))
    index = index + 0.1;
}