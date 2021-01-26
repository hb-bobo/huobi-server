import dayjs from "dayjs";
import log4js from "log4js";
import utc from "dayjs/plugin/utc";
import path from "path";
import config from 'config';
import { mkdir } from "ROOT/utils";

dayjs.extend(utc);

// const isDev = config.get('env') === 'dev';
const basePath = path.resolve(__dirname, "../../logs");
const errorPath = path.resolve(basePath, "err");
const outPath = path.resolve(basePath, "out");

const layout = {
    type: 'pattern',
    pattern: '[%x{customDate}] [%p] %c - %m%n',
    tokens: {
        customDate: function (logEvent) {
            // modify as you want the timestamp for example getting it in the local time zone
            // return logEvent.startTime.toLocaleString();
            return dayjs(logEvent.startTime).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
        }
    }
}

log4js.configure({
    appenders: {
        stdout: {
            type: 'console',
            // layout: isDev ? layout : undefined
        },
        error: {
            type: "dateFile", // 日志类型
            filename: path.resolve(errorPath, "app-err"), // 日志输出位置
            alwaysIncludePattern: true, // 是否总是有后缀名
            pattern: "yyyy-MM-dd.log", // 后缀，每小时创建一个新的日志文件
            layout
        },
        out: {
            type: "dateFile",
            filename: path.resolve(outPath, "app-out"),
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
    disableClustering: true,
});
// 创建log的根目录'logs'
if (basePath) {
    mkdir(basePath);
    // 根据不同的logType创建不同的文件目录
    mkdir(errorPath);
    mkdir(outPath);
}
export const outLogger = log4js.getLogger('out');
export const errLogger = log4js.getLogger('error');

