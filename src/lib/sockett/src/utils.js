"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClosed = exports.isOpen = void 0;
const ws_1 = __importDefault(require("ws"));
function isOpen(ws) {
    return ws !== undefined && ws.readyState === ws_1.default.OPEN;
}
exports.isOpen = isOpen;
function isClosed(ws) {
    return ws !== undefined && ws.readyState === ws_1.default.OPEN;
}
exports.isClosed = isClosed;
