"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.deleteOne = exports.updateOne = exports.findOne = exports.find = void 0;
const lodash_1 = require("lodash");
const logger_1 = require("../../common/logger");
const AutoOrderConfig_entity_1 = __importDefault(require("./AutoOrderConfig.entity"));
/**
 * 查询
 * @param {object} query
 */
const find = async function (query) {
    const res = await AutoOrderConfig_entity_1.default.find(query);
    return res;
};
exports.find = find;
/**
 * 查询单个
 * @param {object} query
 */
const findOne = async function (query) {
    return AutoOrderConfig_entity_1.default.findOne(query);
};
exports.findOne = findOne;
/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
const updateOne = async function (query, newData, options) {
    return AutoOrderConfig_entity_1.default.update(query, newData, options);
};
exports.updateOne = updateOne;
/**
 * 删除单个
 * @param {object} query
 * @param { Document }
 */
const deleteOne = async function (query) {
    const target = await exports.findOne(query);
    if (!target) {
        return Promise.reject('remove fail, target not exist');
    }
    const deleted = await AutoOrderConfig_entity_1.default.remove(target);
    if (lodash_1.isNil(deleted)) {
        logger_1.errLogger.info(query);
        return Promise.reject('remove fail');
    }
    return target;
};
exports.deleteOne = deleteOne;
/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
const create = async function (data) {
    const Doc = AutoOrderConfig_entity_1.default.create(data);
    return Doc.save();
};
exports.create = create;
