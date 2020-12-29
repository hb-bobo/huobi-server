

import config from 'config';
import { isNil } from 'lodash';
import { errLogger } from "ROOT/common/logger";
import pagination from "ROOT/common/pagination";
import { Pagination } from "ROOT/interface/List";
import { getRepository, SaveOptions } from "typeorm";
import ConfigEntity from './config.entity';

/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: Partial<ConfigEntity> = {}, paginationOption?: Pagination) {
    const {skip, take, current} = pagination(paginationOption);
    const [list, total] = await getRepository(ConfigEntity)
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
}

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
export const create = async function(data: Partial<ConfigEntity>) {
    const queryData = await ConfigEntity.findOne({type: data.type});
    if (queryData) {
        throw Error(`${data.type} 已存在`);
    }
    const Doc = ConfigEntity.create(data);
    return Doc.save();
}