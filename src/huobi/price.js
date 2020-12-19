"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SymbolPrice_1 = __importDefault(require("../common/SymbolPrice"));
const symbolPrice = new SymbolPrice_1.default('huobi');
exports.default = symbolPrice;
