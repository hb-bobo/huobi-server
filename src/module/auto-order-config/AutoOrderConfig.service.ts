import { isNil } from "lodash";
import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants/common";
import { SaveOptions } from "typeorm";
import AutoOrderConfigEntity from "./AutoOrderConfig.entity";

/**
 * 查询
 * @param {object} query
 */
export const find = async function(query: Record<string, any>) {
    const res = await AutoOrderConfigEntity.find({})
    return res;
}

/**
 * 查询单个
 * @param {object} query
 */
export const findOne = async function(query: Partial<AutoOrderConfigEntity>) {
    return AutoOrderConfigEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
export const updateOne = async function(query: Partial<AutoOrderConfigEntity>, newData: Partial<AutoOrderConfigEntity>, options?: SaveOptions) {
    return AutoOrderConfigEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<AutoOrderConfigEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await AutoOrderConfigEntity.remove(target);
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
export const create = async function(data: Partial<AutoOrderConfigEntity>) {
    const Doc = AutoOrderConfigEntity.create(data)
    return Doc.save();
}
