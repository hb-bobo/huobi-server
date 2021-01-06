"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEY_MAP = exports.redis = exports.createRedis = exports.redisConfig = void 0;
const config_1 = __importDefault(require("config"));
const ioredis_1 = __importDefault(require("ioredis"));
exports.redisConfig = config_1.default.get("redis");
function createRedis() {
    return new ioredis_1.default(exports.redisConfig);
}
exports.createRedis = createRedis;
exports.redis = new ioredis_1.default(exports.redisConfig);
exports.KEY_MAP = {
    'watch-symbol': 'watch-symbol',
    'ws-sub': 'ws-sub'
};
