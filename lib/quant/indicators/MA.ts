
interface Option {
    max?: number
}
/**
 * MA平均线
 */
export default class MA {
    public count: number;
    public result: Array<number & string>;
    public option: Option = {};
    constructor(count: number, option: Option) {
        this.option = option;
        this.count = count;
        this.result = [];
        // 缓存最新的${this.count}个数据
        this._datas = [];
    }
    public each(data: any[], index: number, key: string) {
        if (Array.isArray(data) && index !== undefined) {
            if (index < this.count) {
                this.result.push('-');
                return;
            }
            let sum = 0;
            for (let j = 0; j < this.count; j++) {
                sum += data[index - j][key];
            }
            this.result.push(sum / this.count);
            this.checkFull();
        }
    }
    public push(data, index) {
        // ws的数据/ 单个数据
        if (this.result.length < this.count) {
            this.result.push('-');
            this._datas.push(data);
            return;
        }
        
        this._datas.push(data);
        //  最新的${this.count}个数据求和
        const sum = this._datas.reduce(function (previousValue, currentValue) {
            return previousValue + Number(currentValue);
        });
        this.result.push(sum / this._datas.length);
        // 没有达到${this.count}个只更新局部的avg
        // if (this.tempCount < this.count) {
        //     this.tempCount++;
        //     this.result[this.result.length - 1] = (sum) / (this._datas.length)
        // } else {
            
        //     // this.result.push(this.tempSum / this.count);
        //     this.tempCount = 0;
        // }
        // 只缓存最新的${this.count}个数据，多了就删除
        if (this._datas.length > this.count) {
            this._datas.shift();
        }
        // console.log(this)
        this.checkFull();
        
    }
    public checkFull() {
        if (this.result.length > this.length) {
            this.result.shift();
        }
    }   
    public last() {
        return this.result[this.result.length - 1];
    }
}