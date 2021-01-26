"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errLogger = exports.outLogger = void 0;
const log4js_1 = __importDefault(require("log4js"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const basePath = path_1.default.resolve(__dirname, "../../logs");
const errorPath = path_1.default.resolve(basePath, "err");
const outPath = path_1.default.resolve(basePath, "out");
const layout = {
    type: 'pattern',
    pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c%]- %m%n',
    tokens: {
        customDate: function (logEvent) {
            // modify as you want the timestamp for example getting it in the local time zone
            return logEvent.startTime.toLocaleString();
        }
    }
};
log4js_1.default.configure({
    appenders: {
        stdout: {
            type: 'console',
            layout
        },
        error: {
            type: "dateFile",
            filename: path_1.default.resolve(errorPath, "app-err"),
            alwaysIncludePattern: true,
            pattern: "yyyy-MM-dd.log",
            layout
        },
        out: {
            type: "dateFile",
            filename: path_1.default.resolve(outPath, "app-out"),
            alwaysIncludePattern: true,
            pattern: "yyyy-MM-dd.log",
            layout
        }
    },
    categories: {
        error: { appenders: ['error', 'stdout'], level: 'error' },
        out: { appenders: ["out", 'stdout'], level: "info" },
        default: { appenders: ['error', 'out',], level: 'trace' }
    },
    pm2: true,
    pm2InstanceVar: 'INSTANCE_ID',
    disableClustering: true
});
// 创建log的根目录'logs'
if (basePath) {
    utils_1.mkdir(basePath);
    // 根据不同的logType创建不同的文件目录
    utils_1.mkdir(errorPath);
    utils_1.mkdir(outPath);
}
exports.outLogger = log4js_1.default.getLogger('out');
exports.errLogger = log4js_1.default.getLogger('error');
