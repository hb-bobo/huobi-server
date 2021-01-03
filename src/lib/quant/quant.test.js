"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hbsdk_1 = require("../../huobi/hbsdk");
const fs_1 = require("fs");
const path_1 = require("path");
const dayjs_1 = __importDefault(require("dayjs"));
const symbol = 'btcusdt';
const period = '5min';
hbsdk_1.hbsdk_commom
    .getMarketHistoryKline({ symbol: symbol, size: 200, period: period })
    .then((data) => {
    fs_1.writeFileSync(path_1.join(__dirname, `data/${symbol}-${period}-${dayjs_1.default().format("YYYY-MM-DD")}.json`), JSON.stringify(data));
});
