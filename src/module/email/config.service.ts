

import config from 'config';
import { errLogger } from "ROOT/common/logger";
import { getRepository, SaveOptions } from "typeorm";
import { isNullOrUndefined } from "util";
import ConfigEntity from './config.entity';


/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<ConfigEntity>) {
    return ConfigEntity.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: Partial<ConfigEntity>, newData: Partial<ConfigEntity>, options?: SaveOptions) {
    return ConfigEntity.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<ConfigEntity>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await ConfigEntity.remove(target);
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
export const create = async function(data: Partial<ConfigEntity>) {
    const queryData = await ConfigEntity.findOne({mail: data.mail});
    if (queryData) {
        throw Error(`${data.mail} 已存在`);
    }
    const Doc = ConfigEntity.create(data);
    return Doc.save();
}