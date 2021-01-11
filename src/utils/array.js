"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepeatCount = void 0;
/**
 * 获取数组元素出现的次数
 * @param {Array<number & string>} arr
 * @return { object }
 */
exports.getRepeatCount = function (arr) {
    const res = {};
    arr.forEach(item => {
        if (res[item] === undefined) {
            res[item] = 1;
        }
        else {
            res[item]++;
        }
    });
    return res;
};
