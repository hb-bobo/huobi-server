"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.os = void 0;
var cmd_1 = require("./cmd");
Object.defineProperty(exports, "exec", { enumerable: true, get: function () { return cmd_1.default; } });
var getRepeatCount_1 = require("./getRepeatCount");
Object.defineProperty(exports, "getRepeatCount", { enumerable: true, get: function () { return getRepeatCount_1.default; } });
var sentMail_1 = require("./sentMail");
Object.defineProperty(exports, "sentMail", { enumerable: true, get: function () { return sentMail_1.default; } });
var keepDecimalFixed_1 = require("./keepDecimalFixed");
Object.defineProperty(exports, "keepDecimalFixed", { enumerable: true, get: function () { return keepDecimalFixed_1.default; } });
const os = __importStar(require("./os"));
exports.os = os;
