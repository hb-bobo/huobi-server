import { isNumber, omit, toNumber } from "lodash";
import { autoToFixed } from "../../../utils";
import { MA } from "../indicators";

interface DataItem {
    "id": number,
    "open": number,
    "close": number,
    "low": number,
    "high": number,
    "amount": string,
    "vol": string,
    "count": number,
}
interface AnalyserDataItem extends DataItem{
    "time": string;
    "MA5": number | null;
    "MA10": number | null;
    "MA30": number | null;
    "MA60": number | null;
    "amountMA20": number | null;
    /**
     * 超跌 < 0
     * 超买 > 0
     */
    "close/MA60": number;
    "amount/amountMA20": number;
    [x: string]: any;
}
/**
 * 量化
 */
export default class Analyser {
    result: Record<string, any>[] = [];
    middlewares: ((row: Record<string, any>) => void)[] = [];
    private MA5 = new MA(5);
    private MA10 = new MA(10);
    private MA30 = new MA(30);
    private MA60 = new MA(60);
    private amountMA20 = new MA(20);
    /**
     * 量化指标分析
     */
    constructor() {
        //
    }
    public analysis(data: DataItem | DataItem[]) {
        this.MA5
        if (Array.isArray(data)) {
            data.forEach(item=> {
                this._analysis(item)
            });
            return;
        }
        this._analysis(data)
    }
    public _analysis(data: DataItem) {
        this.amountMA20.push(toNumber(data.amount))
        this.MA5.push(data.close)
        this.MA10.push(data.close)
        this.MA30.push(data.close)
        this.MA60.push(data.close)
        const newData = omit(data, 'id');
        const row = {
            ...newData,
            time: new Date(Number(data.id + '000')),
            MA5: autoToFixed(this.MA5.last()) || null,
            MA10: autoToFixed(this.MA10.last()) || null,
            MA30: autoToFixed(this.MA30.last()) || null,
            MA60: autoToFixed(this.MA60.last()) || null,
            amountMA20: autoToFixed(this.amountMA20.last()) || null,
        }
        /**
         * 超跌 < 0
         * 超买 > 0
         */
        row['close/MA60'] = this.getGain(row.close, row.MA60);
        row['amount/amountMA20'] = this.getGain(row.amount, row.amountMA20);
        /**
         * 买盘力量大
         */
        row['low-close'] = (row.low - row.close) / row.close;
        /**
         * 卖盘力量大
         */
        row['high-close'] = (row.high - row.close) / row.close;

        this.middlewares.forEach((callback) => {
            callback(row);
        })
        this.result.push(row)
    }
    /**
     * 获取涨跌幅
     */
    getGain(close, ma) {
        if (!isNumber(close) || !isNumber(ma)) {
            return 0;
        }
        return (close - ma) / ma;
    }
    /**
     * 添加中间件
     * @param middleware
     */
    use(middleware: (row: AnalyserDataItem) => void) {
        if (typeof middleware !== 'function') {
            throw Error('use param muse be a function');
        }
        this.middlewares.push(middleware);
    }
}