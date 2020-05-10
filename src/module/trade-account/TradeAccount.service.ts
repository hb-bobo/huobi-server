import { errLogger, outLogger } from "ROOT/common/logger";

import { SaveOptions } from "typeorm";
import { isNullOrUndefined, isNumber } from "util";
import TradeAccountEntity from "./TradeAccount.entity";

/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object) {
    const res = await TradeAccountEntity.find({})
    return res;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<TradeAccountEntity>) {
    return TradeAccountEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: Partial<TradeAccountEntity>, newData: Partial<TradeAccountEntity>, options?: SaveOptions) {
    return TradeAccountEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<TradeAccountEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await TradeAccountEntity.remove(target);
    if (isNullOrUndefined(deleted)) {
        errLogger.info(query)
        return Promise.reject('删除出错');
    }
    return;
}

/**
 * 新增
 * @param {object} query 
 * @param { Document }
 */
export const create = async function(data: Partial<TradeAccountEntity>) {
    const Doc = TradeAccountEntity.create(data)
    return Doc.save();
}