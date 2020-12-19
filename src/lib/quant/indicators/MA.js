"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOption = {
    max: 600,
};
/**
 * MA平均线
 */
class MA {
    constructor(count, option = {}) {
        this.option = {};
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
    push(value) {
        // 数据量还不够${this.count}个
        if (this.result.length < this.count) {
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
        if (this._datas.length > this.count) {
            this._datas.shift();
        }
        this.checkMax();
    }
    last() {
        return this.result[this.result.length - 1];
    }
    checkMax() {
        if (this.result.length > this.option.max) {
            this.result.shift();
        }
    }
}
exports.default = MA;
