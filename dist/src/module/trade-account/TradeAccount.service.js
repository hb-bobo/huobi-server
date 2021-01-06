"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.deleteOne = exports.updateOne = exports.findOne = exports.find = void 0;
const logger_1 = require("../../common/logger");
const isNil_1 = __importDefault(require("lodash/isNil"));
const TradeAccount_entity_1 = __importDefault(require("./TradeAccount.entity"));
/**
 * 查询
 * @param {object} query
 */
exports.find = async function (query) {
    const res = await TradeAccount_entity_1.default.find({});
    return res;
};
/**
 * 查询单个
 * @param {object} query
 */
exports.findOne = async function (query) {
    return TradeAccount_entity_1.default.findOne(query);
};
/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
exports.updateOne = async function (query, newData, options) {
    return TradeAccount_entity_1.default.update(query, newData, options);
};
/**
 * 删除单个
 * @param {object} query
 * @param { Document }
 */
exports.deleteOne = async function (query) {
    const target = await exports.findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await TradeAccount_entity_1.default.remove(target);
    if (isNil_1.default(deleted)) {
        logger_1.errLogger.info(query);
        return Promise.reject('删除出错');
    }
    return;
};
/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
exports.create = async function (data) {
    const Doc = TradeAccount_entity_1.default.create(data);
    return Doc.save();
};
