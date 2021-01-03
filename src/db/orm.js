"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbEvent = void 0;
const config_1 = __importDefault(require("config"));
const events_1 = __importDefault(require("events"));
const logger_1 = require("../common/logger");
const typeorm_1 = require("typeorm");
const dbConfig = config_1.default.get("dbConfig");
const connectionConfig = {
    name: "default",
    type: "mysql",
    host: dbConfig.host,
    username: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    database: dbConfig.database,
    insecureAuth: true,
    synchronize: true,
    logging: false,
    charset: "utf8mb4",
    entities: ["src/module/**/*.entity.ts", "src/module/**/*.entity.js"],
    subscribers: ["src/subscriber/*.ts", "src/subscriber/*.js"],
    migrations: ["src/migration/*.ts", "src/migration/*.js"]
};
exports.dbEvent = new events_1.default.EventEmitter();
function start() {
    /**
     * 启动TypeORM
     */
    typeorm_1.createConnection(connectionConfig)
        .then(() => {
        exports.dbEvent.emit("connected");
        logger_1.outLogger.info(`MySQL: database ${dbConfig.database} connected`);
    })
        .catch(error => {
        logger_1.errLogger.error(`MySQL: ${String(error)}`);
        setTimeout(() => {
            start();
        }, 1000 * 60);
    });
}
start();
