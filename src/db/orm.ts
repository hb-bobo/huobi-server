import config from "config";
import events from "events";
import mysql from "mysql";
import { errLogger, outLogger } from "ROOT/common/logger";
import { AppConfig } from "ROOT/interface/App";
import { createConnection, ConnectionOptions } from "typeorm";
const dbConfig = config.get<AppConfig["dbConfig"]>("dbConfig");

const connectionConfig: ConnectionOptions = {
    name: "default",
    type: "mysql" as const,
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
export const dbEvent = new events.EventEmitter();



function start () {
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
        setTimeout(() => {
            start();
        }, 1000 * 60);
    });
}

start();
