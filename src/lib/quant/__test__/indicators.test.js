"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const indicators_1 = require("../indicators");
test('MA', () => {
    const ma5 = new indicators_1.MA(5);
    const arr = [1, 2, 4, 7, 9, 20, 11, 10, 6, 3, 1, 0];
    arr.forEach(item => {
        ma5.push(item);
    });
    expect(ma5.result).toEqual(arr.length);
    expect(ma5.last()).toEqual(4);
});
