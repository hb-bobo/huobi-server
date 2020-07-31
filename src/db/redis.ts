import config from "config";
import Redis  from "ioredis";
import { errLogger, outLogger } from "ROOT/common/logger";
import { AppConfig } from "ROOT/interface/App";

const redisConfig = config.get<AppConfig["redis"]>("redis");



export const redis = new Redis(redisConfig);
