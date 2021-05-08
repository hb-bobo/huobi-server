import { isNumber, omit, toNumber } from "lodash";
import dayjs from 'dayjs';
import { autoToFixed, keepDecimalFixed } from "../util";
import { MA } from "../indicators";

export interface DataItem {
    "id": number,
    "open": number,
    "close": number,
    "low": number,
    "high": number,
    "amount": string,
    "vol": string,
    "count": number,
}
export interface AnalyserDataItem extends DataItem{
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
    /**
     * 振幅
     */
    amplitude: number;
    /**
     * 涨跌幅
     */
    changepercent: number;
    [x: string]: any;
}

interface Options {
    /**
     * 分析结果最长记录，超出会删除
     */
    maxResult: number;
}
/**
 * 量化
 */
export default class Analyser {
    result: Record<string, any>[] = [];
    middlewares: ((row: Record<string, any>) => void)[] = [];
    maxResult: number;
    private MA5 = new MA(5);
    private MA10 = new MA(10);
    private MA30 = new MA(30);
    private MA60 = new MA(60);
    private MA120 = new MA(120);
    private amountMA20 = new MA(20);
    /**
     * 量化指标分析
     */
    constructor({maxResult} = {} as Options) {
        this.maxResult = maxResult || -1;
        //
    }
    public analysis<T extends Record<string, any>>(data: T | T[]) {
        this.MA5
        if (Array.isArray(data)) {
            data.forEach(item=> {
                this._analysis(item)
            });
            return;
        }
        this._analysis(data)
    }
    public _analysis<T extends Record<string, any>>(data: T){

        this.MA5.push(data.close);
        this.MA10.push(data.close);
        this.MA30.push(data.close);
        this.MA60.push(data.close);
        this.MA120.push(data.close);
        const newData = omit(data, 'id');
        const row: Record<string, any> = {
            ...newData,
            time: dayjs(Number(data.id + '000')).format("YYYY-MM-DD HH:mm:ss"),
            MA5: autoToFixed(this.MA5.last()) || null,
            MA10: autoToFixed(this.MA10.last()) || null,
            MA30: autoToFixed(this.MA30.last()) || null,
            MA60: autoToFixed(this.MA60.last()) || null,
            MA120: autoToFixed(this.MA120.last()) || null,
        }


        if (data.amount !== undefined) {
            this.amountMA20.push(toNumber(data.amount));
            row.amountMA20 = autoToFixed(this.amountMA20.last()) || null;
            row['amount/amountMA20'] = this.getGain(Number(row.amount), row.amountMA20);
        }
        /**
         * 超跌 < 0
         * 超买 > 0
         */
        row['close/MA60'] = this.getGain(row.close, row.MA60);

        /**
         * 买盘力量大
         */
        row['low-close/close'] = autoToFixed((row.low - row.close) / Math.abs(row.low - row.high));
        /**
         * 卖盘力量大
         */
        row['high-close/close'] = autoToFixed((row.high - row.close) / Math.abs(row.low - row.high));
        const preRow = this.result[this.result.length - 1];

        if (preRow) {
            row.amplitude = keepDecimalFixed((row.high - row.low) / preRow.close, 3) * 100;
            row.changepercent = keepDecimalFixed((row.close - preRow.close) / preRow.close, 3) * 100;
        } else {
            row.amplitude = 0;
        }


        this.middlewares.forEach((callback) => {
            callback(row);
        })
        this.result.push(row);
        this.checkMax();
    }
    private checkMax() {
        if (this.result.length > this.maxResult && this.maxResult > 0) {
            this.result.shift();
        }
    }
    /**
     * 获取涨跌幅
     */
    getGain(close, ma) {
        if (!isNumber(close) || !isNumber(ma)) {
            return 0;
        }
        return autoToFixed((close - ma) / ma);
    }
    getLast = (n: number) => {
        return this.result.slice(this.result.length - n - 1, this.result.length - 1);
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
        // unuse
        return () => {
            const index = this.middlewares.findIndex((fn) => fn === middleware);
            if (index > -1) {
                this.middlewares.splice(index, 1);
            }
        }
    }
}
