"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.deleteOne = exports.updateOne = exports.findOne = exports.find = void 0;
const lodash_1 = require("lodash");
const logger_1 = require("../../common/logger");
const pagination_1 = __importDefault(require("../../common/pagination"));
const typeorm_1 = require("typeorm");
const config_entity_1 = __importDefault(require("./config.entity"));
/**
 * 查询
 * @param {object} query
 */
const find = async function (query = {}, paginationOption) {
    const { skip, take, current } = pagination_1.default(paginationOption);
    const [list, total] = await typeorm_1.getRepository(config_entity_1.default)
        .createQueryBuilder("FeedbackEntity")
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
 * 查询单个
 * @param {object} query
 */
const findOne = async function (query) {
    return config_entity_1.default.findOne(query);
};
exports.findOne = findOne;
/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
const updateOne = async function (query, newData, options) {
    return config_entity_1.default.update(query, newData, options);
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
        return Promise.reject('删除出错');
    }
    const deleted = await config_entity_1.default.remove(target);
    if (lodash_1.isNil(deleted)) {
        logger_1.errLogger.info(query);
        return Promise.reject('删除出错');
    }
    return;
};
exports.deleteOne = deleteOne;
/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
const create = async function (data) {
    const queryData = await config_entity_1.default.findOne({ type: data.type });
    if (queryData) {
        throw Error(`${data.type} 已存在`);
    }
    const Doc = config_entity_1.default.create(data);
    return Doc.save();
};
exports.create = create;
