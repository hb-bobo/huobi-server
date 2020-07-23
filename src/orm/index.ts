import config from "config";
import events from "events";
import mysql from "mysql";
import { errLogger, outLogger } from "ROOT/common/logger";
import { AppConfig } from "ROOT/interface/App";
import { createConnection } from "typeorm";
const dbConfig = config.get<AppConfig["dbConfig"]>("dbConfig");

const connectionConfig = {
    name: "default",
    type: "mysql" as "mysql",
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    database: dbConfig.database,
    insecureAuth: true,
    useConnectionPooling: true,
    synchronize: true,
    logging: false,
    charset: "utf8mb4",
    entities: ["src/module/**/*.entity.ts", "src/module/**/*.entity.js"],
    subscribers: ["src/subscriber/*.ts", "src/subscriber/*.js"],
    migrations: ["src/migration/*.ts", "src/migration/*.js"]
};
export const dbEvent = new events.EventEmitter();

/**
 * 先用原生创建database
 * TypeORM暂时不知道在哪创建
 */
const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
});
connection.connect();
// 创建database
connection.query(
    `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARSET utf8 COLLATE utf8_general_ci`,
    function(err, results, fields) {
        if (err) {
            throw err;
        }
        /**
         * 启动TypeORM
         */
        createConnection(connectionConfig)
            .then(() => {
                dbEvent.emit("connected");
                outLogger.info(
                    `MySQL: database ${dbConfig.database} connected`
                );
            })
            .catch(error => {
                errLogger.error(`MySQL: ${String(error)}`);
            });
    }
);
