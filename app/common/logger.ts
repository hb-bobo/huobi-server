import { os } from "APP/utils";
import log4js from "log4js";
import path from "path";

const basePath = path.resolve(__dirname, "../../logs");
const errorPath = path.resolve(basePath, "err");
const outPath = path.resolve(basePath, "out");

log4js.configure({
  appenders: {
    stdout: {
      type: 'console'
    },
    error: {
      type: "dateFile", // 日志类型
      filename: path.resolve(errorPath, "app-err"), // 日志输出位置
      alwaysIncludePattern: true, // 是否总是有后缀名
      pattern: "yyyy-MM-dd.log" // 后缀，每小时创建一个新的日志文件
    },
    out: {
      type: "dateFile",
      filename: path.resolve(outPath, "app-out"),
      alwaysIncludePattern: true,
      pattern: "yyyy-MM-dd.log"
    }
  },
  categories: {
    error: { appenders: ['error', 'stdout'], level: 'error' },
    out: { appenders: ["out", 'stdout'], level: "info" },
    default: { appenders: ['error','out',], level: 'trace' }
  },
  pm2: true,
  pm2InstanceVar: 'INSTANCE_ID',
  disableClustering: true
});
// 创建log的根目录'logs'
if (basePath) {
  os.mkdir(basePath);
  // 根据不同的logType创建不同的文件目录
  os.mkdir(errorPath);
  os.mkdir(outPath);
}
export const outLogger = log4js.getLogger('out');
export const errLogger = log4js.getLogger('error');

