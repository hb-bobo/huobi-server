import config from "config";
import Redis  from "ioredis";
import { errLogger, outLogger } from "ROOT/common/logger";
import { AppConfig } from "ROOT/interface/App";

const redisConfig = config.get<AppConfig["redis"]>("redis");



export const redis = new Redis(redisConfig);
export const KEY_MAP = {
    'watch-symbol': 'watch-symbol',
    'ws-sub': 'ws-sub'
}
