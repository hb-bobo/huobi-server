"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
}
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./constant"), exports);
var HuobiSDK_1 = require("./HuobiSDK");
Object.defineProperty(exports, "HuobiSDK", { enumerable: true, get: function () { return HuobiSDK_1.default; } });
var HuobiSDK_2 = require("./HuobiSDK");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return HuobiSDK_2.default; } });
var HuobiSDKBase_1 = require("./HuobiSDKBase");
Object.defineProperty(exports, "HuobiSDKBase", { enumerable: true, get: function () { return HuobiSDKBase_1.HuobiSDKBase; } });
__exportStar(require("./interface"), exports);
