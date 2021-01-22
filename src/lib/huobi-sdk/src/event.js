"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ws_event = void 0;
const events_1 = require("events");
class Eventss extends events_1.EventEmitter {
}
// 自定义事件
exports.ws_event = new Eventss();
