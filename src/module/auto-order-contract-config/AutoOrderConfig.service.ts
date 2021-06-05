import { isNil } from "lodash";
import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants/common";
import { SaveOptions } from "typeorm";
import AutoOrderContractConfigEntity from "./AutoOrderConfig.entity";

/**
 * 查询
 * @param {object} query
 */
export const find = async function(query: Record<string, any>) {
    const res = await AutoOrderContractConfigEntity.find(query)
    return res;
}

/**
 * 查询单个
 * @param {object} query
 */
export const findOne = async function(query: Partial<AutoOrderContractConfigEntity>) {
    return AutoOrderContractConfigEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
export const updateOne = async function(query: Partial<AutoOrderContractConfigEntity>, newData: Partial<AutoOrderContractConfigEntity>, options?: SaveOptions) {
    return AutoOrderContractConfigEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<AutoOrderContractConfigEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('remove fail, target not exist');
    }
    const deleted = await AutoOrderContractConfigEntity.remove(target);
    if (isNil(deleted)) {
        errLogger.info(query)
        return Promise.reject('remove fail');
    }
    return target;
}

/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
export const create = async function(data: Partial<AutoOrderContractConfigEntity>) {
    const Doc = AutoOrderContractConfigEntity.create(data)
    return Doc.save();
}
