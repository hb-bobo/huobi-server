"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.updateOne = exports.find = void 0;
const AutoOrderHistory_entity_1 = __importDefault(require("./AutoOrderHistory.entity"));
const typeorm_1 = require("typeorm");
const huobi_1 = require("../../constants/huobi");
const pagination_1 = __importDefault(require("../../common/pagination"));
const utils_1 = require("../../utils");
// export class AutoOrderHistoryService extends CrudService<AutoOrderHistory>{
// }
// export default new AutoOrderHistoryService(AutoOrderHistory);
/**
 * 查询
 * @param {object} query
 */
const find = async function (query = {}, paginationOption) {
    const { skip, take, current } = pagination_1.default(paginationOption);
    const [list, total] = await typeorm_1.getRepository(AutoOrderHistory_entity_1.default)
        .createQueryBuilder()
        .where(query)
        .orderBy('datetime', 'DESC')
        .skip(skip)
        .take(take)
        .getManyAndCount();
    return {
        list: list.map((item) => {
            return {
                ...item,
            };
        }),
        pagination: {
            current,
            pageSize: take,
            total,
        }
    };
};
exports.find = find;
/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
const updateOne = async function (query, newData, options) {
    return AutoOrderHistory_entity_1.default.update(query, newData, options);
};
exports.updateOne = updateOne;
/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
const create = async function (data) {
    data.status = huobi_1.TRADE_STATUS.wait;
    data.amount = utils_1.autoToFixed(data.amount);
    data.price = utils_1.autoToFixed(data.price);
    const Doc = AutoOrderHistory_entity_1.default.create(data);
    return Doc.save();
};
exports.create = create;
