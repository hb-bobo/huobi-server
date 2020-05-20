import config from 'config';
import events from 'events';
import { errLogger, outLogger } from "ROOT/common/logger";
import { AppConfig } from 'ROOT/interface/App';
import {createConnection} from "typeorm";
const dbConfig = config.get<AppConfig['dbConfig']>('dbConfig');

const connectionConfig = {
    "name": "default",
    "type": "mysql" as 'mysql',
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    database: dbConfig.database,
    insecureAuth: true,
    useConnectionPooling: true,
    "synchronize": true,
    "logging": false,
    "entities": [
      "src/module/**/*.entity.ts"
    ],
    "subscribers": [
      "src/subscriber/*.ts"
    ],
    "migrations": [
      "src/migration/*.ts"
    ],
};
export const dbEvent = new events.EventEmitter();

createConnection(connectionConfig).then(connection => {
    dbEvent.emit('connected');
    outLogger.info('Mysql connection disconnected', connection);
}).catch(error => {
    errLogger.error('Mysql connection error: ' + error);
});
