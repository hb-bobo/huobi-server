"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.find = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const typeorm_1 = require("typeorm");
const trade_entity_1 = require("./trade.entity");
/**
 * 查询
 * @param {object} query
 */
exports.find = async function ({ start, end, symbol }) {
    const tableNames = trade_entity_1.tableNameFactory.queryWidthIntervalTime(start, end);
    let query = tableNames.map((name) => {
        return `
        SELECT * FROM ${name}
        WHERE time BETWEEN '${dayjs_1.default(start).format('YYYY/MM/DD H:mm:ss')}' AND '${dayjs_1.default(end).format('YYYY/MM/DD H:mm:ss')}'
        AND symbol='${symbol}'
        `;
    });
    const res = await typeorm_1.getConnection()
        .query(query.join('UNION ALL\n'));
    // let res: TradeDTO[] = []
    // const res = await getConnection()
    //     .getRepository<TradeDTO>(tableNames[0])
    //     .createQueryBuilder('trade')        
    //     .addFrom(tableNames[1], tableNames[1]).getMany()
    // for (let i = 0; i < tableNames.length; i++) {
    //     const tableName = tableNames[i];
    //     if (entitysMap[tableName] === undefined) {
    //         createEntitySchema(tableName);
    //     }
    //     const list = await getManager()
    //     .getRepository<TradeDTO>(entitysMap[tableName])
    //     .createQueryBuilder('trade')        
    //     .from
    //     .where('trade.time BETWEEN :start AND :end', {start, end})
    //     .andWhere('trade.symbol = :symbol', {symbol})
    //     .getMany();
    //     res = res.concat(list)
    // }
    return res;
};
/**
 * 新增
 */
exports.create = async function (data) {
    const repository = await typeorm_1.getRepository(trade_entity_1.entitysMap[trade_entity_1.tableNameFactory.getTableName()]);
    return repository.save(data);
};