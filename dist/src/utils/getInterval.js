"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterval = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
/**
 * 获取一段时间
 * @param {string} time 24h
 * @return {Date[]}
 */
function getInterval(timeDesription) {
    const metchResult = timeDesription.match(/\d+/);
    const time = typeof metchResult === 'number' ? metchResult[0] : 24;
    let factor = 60 * 60 * 1000;
    if (timeDesription.includes('h')) {
        factor = 60 * 60 * 1000;
    }
    return [
        dayjs_1.default(Date.now() - (time * factor)).format("YYYY/MM/DD H:mm:ss"),
        dayjs_1.default().format("YYYY/MM/DD H:mm:ss")
    ];
}
exports.getInterval = getInterval;
