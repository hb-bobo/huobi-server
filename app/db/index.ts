import config from 'config';
import events from 'events';
import mongoose from "mongoose";
import { errLogger, outLogger } from "./../common/logger";
const dbConfig = config.get<App.AppConfig['dbConfig']>('dbConfig');

const url = `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

const options = {
    pass: dbConfig.password,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: dbConfig.user,
};
export const dbEvent = new events.EventEmitter();
mongoose.connect(url, options);
// 连接成功
mongoose.connection.on('connected', function() {
    outLogger.info('Mongoose connection open to ', url);
    dbEvent.emit('connected');
});

// 连接异常
mongoose.connection.on('error', function (err) {
    errLogger.error('Mongoose connection error: ' + err);
    setTimeout(() => {
        mongoose.connect(url, options);
    }, 1000);
});

// 断开连接
mongoose.connection.on('disconnected', function () {
    outLogger.info('Mongoose connection disconnected');
});
export default mongoose;