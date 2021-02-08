"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const mergeTime_1 = require("../mergeTime");
class StatisticsKline extends events_1.default {
    constructor(disTime) {
        super();
        this.mergeHandler = mergeTime_1.mergeTime(() => {
            this.emit('merge', this.mergeData);
            this.mergeData = undefined;
        }, disTime);
    }
    merge(data) {
        if (!this.mergeData) {
            this.mergeData = data;
        }
        else {
            this.mergeData = data;
        }
        this.mergeHandler();
    }
}
exports.default = StatisticsKline;
