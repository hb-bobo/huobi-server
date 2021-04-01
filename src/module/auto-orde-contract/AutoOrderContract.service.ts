import { isNil } from "lodash";
import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants/common";
import { SaveOptions } from "typeorm";
import AutoOrderContractEntity from "./AutoOrderContract.entity";

/**
 * 查询
 * @param {object} query
 */
export const find = async function(query: Record<string, any>) {
    const res = await AutoOrderContractEntity.find({})
    return res;
}

/**
 * 查询单个
 * @param {object} query
 */
export const findOne = async function(query: Partial<AutoOrderContractEntity>) {
    return AutoOrderContractEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
export const updateOne = async function(query: Partial<AutoOrderContractEntity>, newData: Partial<AutoOrderContractEntity>, options?: SaveOptions) {
    return AutoOrderContractEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<AutoOrderContractEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await AutoOrderContractEntity.remove(target);
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
export const create = async function(data: Partial<AutoOrderContractEntity>) {
    const Doc = AutoOrderContractEntity.create(data)
    return Doc.save();
}
