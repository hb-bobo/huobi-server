"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ws_event = exports.EventTypes = void 0;
const events_1 = require("events");
var EventTypes;
(function (EventTypes) {
    EventTypes["huobi_kline"] = "huobi:kline";
    EventTypes["huobi_trade"] = "huobi:trade";
    EventTypes["huobi_depth"] = "huobi:depth";
    EventTypes["huobi_depth_chart"] = "huobi:depth_chart";
    EventTypes["huobi_open"] = "huobi:open";
})(EventTypes = exports.EventTypes || (exports.EventTypes = {}));
class Eventss extends events_1.EventEmitter {
}
// 自定义事件
exports.ws_event = new Eventss();
