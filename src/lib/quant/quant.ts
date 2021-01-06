import { omit, toNumber } from "lodash";
import { autoToFixed } from "../../utils";
import { MA } from "./indicators";

interface DataItem {
    "id": number,
    "open": number,
    "close": number,
    "low": number,
    "high": number,
    "amount": string,
    "vol": string,
    "count": 2441
}
/**
 * 量化
 */
export default class Quant {
    result: Record<string, any>[] = [];
    private MA5 = new MA(5)
    private MA10 = new MA(10)
    private MA30 = new MA(30)
    private MA60 = new MA(60)
    private amountMA20 = new MA(20)
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
    private _analysis(data: DataItem) {
        this.amountMA20.push(toNumber(data.amount))
        this.MA5.push(data.close)
        this.MA10.push(data.close)
        this.MA30.push(data.close)
        this.MA60.push(data.close)
        const newData = omit(data, 'id');
        const row: Record<string, any> = {
            ...newData,
            MA5: autoToFixed(this.MA5.last()) || null,
            MA10: autoToFixed(this.MA10.last()) || null,
            MA30: autoToFixed(this.MA30.last()) || null,
            MA60: autoToFixed(this.MA60.last()) || null,
            amountMA20: autoToFixed(this.amountMA20.last()) || null,
            // MA5/
        }
        this.result.push(row)
    }
}
