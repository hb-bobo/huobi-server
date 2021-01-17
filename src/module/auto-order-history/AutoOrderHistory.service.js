"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.updateOne = exports.find = void 0;
const AutoOrderHistory_entity_1 = __importDefault(require("./AutoOrderHistory.entity"));
// export class AutoOrderHistoryService extends CrudService<AutoOrderHistory>{
// }
// export default new AutoOrderHistoryService(AutoOrderHistory);
/**
 * 查询
 * @param {object} query
 */
exports.find = async function (query) {
    const res = await AutoOrderHistory_entity_1.default.find(query);
    return res;
};
/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
exports.updateOne = async function (query, newData, options) {
    return AutoOrderHistory_entity_1.default.update(query, newData, options);
};
/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
exports.create = async function (data) {
    const Doc = AutoOrderHistory_entity_1.default.create(data);
    return Doc.save();
};
