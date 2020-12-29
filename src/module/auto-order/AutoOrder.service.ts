import { isNil } from "lodash";
import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants";
import { SaveOptions } from "typeorm";
import AutoOrderEntity from "./AutoOrder.entity";

/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object) {
    const res = await AutoOrderEntity.find({})
    return res;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<AutoOrderEntity>) {
    return AutoOrderEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: Partial<AutoOrderEntity>, newData: Partial<AutoOrderEntity>, options?: SaveOptions) {
    return AutoOrderEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<AutoOrderEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await AutoOrderEntity.remove(target);
    if (isNil(deleted)) {
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
export const create = async function(data: Partial<AutoOrderEntity>) {
    const Doc = AutoOrderEntity.create(data)
    return Doc.save();
}