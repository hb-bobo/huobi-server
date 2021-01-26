
interface Option {
    max?: number
}
const defaultOption = {
    max: 600,
}
/**
 * MA平均线
 */
export default class MA {
    public count: number;
    public result: Array<number | '-'>;
    public option: Option = {};
    /**
     * 缓存最新的${this.count}个数据
     */
    private _datas: number[];
    constructor(count: number, option: Option = {}) {
        this.option = Object.assign({}, defaultOption, option);
        this.count = count;
        this.result = [];
        this._datas = [];
    }

    /**
     * ws的数据/ 单个数据
     * @param value
     * @param index
     */
    public push(value: number) {
        // 数据量还不够${this.count}个
        if (this.result.length < this.count - 1) {
            this.result.push('-');
            this._datas.push(value);
            return;
        }
        // 添加到临时数组中
        this._datas.push(value);
        //  最新的${this.count}个数据求和
        const sum = this._datas.reduce(function (previousValue, currentValue) {
            return previousValue + Number(currentValue);
        });
        this.result.push(sum / this._datas.length);

        // 只缓存最新的${this.count}个数据，多了就删除
        if (this._datas.length >= this.count) {
            this._datas.shift();
        }

        this.checkMax();

    }
    public last(n = 1) {
        return this.result[this.result.length - n];
    }
    private checkMax() {
        if (this.result.length > (this.option.max as number)) {
            this.result.shift();
        }
    }
}
