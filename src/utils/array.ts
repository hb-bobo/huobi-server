
/**
 * 获取数组元素出现的次数
 * @param {Array<number & string>} arr
 * @return { object }
 */
export const getRepeatCount = function (arr: Array<number & string>) {
    const res = {} as any;
    arr.forEach(item => {
        if (res[item] === undefined) {
            res[item] = 1;
        } else {
            res[item]++;
        }
    });
    return res;
}
