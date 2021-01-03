"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntitySchema = exports.entitysMap = exports.tableNameFactory = void 0;
const typeorm_1 = require("typeorm");
const SplitTableWithYear_1 = require("../../common/SplitTableWithYear");
const logger_1 = require("../../common/logger");
exports.tableNameFactory = new SplitTableWithYear_1.SplitTableWithYear('trade_entity');
exports.entitysMap = {};
function createEntitySchema(name) {
    name = name === undefined ? exports.tableNameFactory.getTableName() : name;
    logger_1.outLogger.info(name, exports.entitysMap);
    if (exports.entitysMap[name]) {
        return;
    }
    exports.entitysMap[name] = new typeorm_1.EntitySchema({
        name: name,
        columns: {
            id: {
                type: Number,
                primary: true,
                generated: true
            },
            symbol: {
                type: String
            },
            buy: {
                type: 'float',
                default: 0.0
            },
            sell: {
                type: 'float',
                default: 0.0
            },
            usdtPrice: {
                type: 'float',
                default: 0.0
            },
            time: {
                type: Date
            }
        }
    });
    return exports.entitysMap[name];
}
exports.createEntitySchema = createEntitySchema;
createEntitySchema();
// 每天检测一次
setInterval(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    if (exports.entitysMap[nextDate.getFullYear()] === undefined) {
        createEntitySchema();
    }
}, 86400000);
