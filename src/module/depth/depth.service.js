"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.find = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const typeorm_1 = require("typeorm");
const depth_entity_1 = require("./depth.entity");
/**
 * 查询
 */
const find = async function ({ start, end, symbol }) {
    const tableNames = depth_entity_1.tableNameFactory.queryWidthIntervalTime(start, end);
    const query = tableNames.map((name) => {
        return `
        SELECT
            *
        FROM ${name}
        WHERE time BETWEEN '${dayjs_1.default(start).format('YYYY/MM/DD H:mm:ss')}' AND '${dayjs_1.default(end).format('YYYY/MM/DD H:mm:ss')}'
        AND symbol='${symbol}'
        `;
    });
    const res = await typeorm_1.getConnection()
        .query(query.join('UNION ALL\n'));
    return res;
};
exports.find = find;
/**
 * 新增
 */
const create = async function (data) {
    const repository = await typeorm_1.getRepository(depth_entity_1.entitysMap[depth_entity_1.tableNameFactory.getTableName()]);
    return repository.save(data);
};
exports.create = create;
