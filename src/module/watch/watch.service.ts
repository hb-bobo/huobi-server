import { isNil } from "lodash";
import { errLogger, outLogger } from "ROOT/common/logger";

import { SaveOptions } from "typeorm";
import WatchEntity from "./watch.entity";

/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object = {}) {
    const res = await WatchEntity.find(query)
    return res;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<WatchEntity>) {
    return WatchEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: Partial<WatchEntity>, newData: Partial<WatchEntity>, options?: SaveOptions) {
    return WatchEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<WatchEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await WatchEntity.remove(target);
    if (isNil(deleted)) {
        errLogger.info(query)
        return Promise.reject('删除出错');
    }
    return deleted;
}

/**
 * 新增
 * @param {object} query 
 * @param { Document }
 */
export const create = async function(data: Partial<WatchEntity>) {
    const Doc = WatchEntity.create(data)
    return Doc.save();
}