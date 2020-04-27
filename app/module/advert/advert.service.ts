import { outLogger } from "APP/common/logger";
import { DEFAULT_PAGE_SIZE } from "APP/constants";
import { Advert } from "APP/interface/Advert";
import { ModelUpdateOptions, Types } from "mongoose";
import { isNullOrUndefined, isNumber } from "util";
import AdvertModel, { IAdvertModel } from "./advert.model";



/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object, { currentPage = 1, pageSize = DEFAULT_PAGE_SIZE, from }) {
    const allList = await AdvertModel.find({});
    // console.log("allList", AdvertModel.length)
    let list = await AdvertModel.find(query, null, {skip: (currentPage - 1) * pageSize}).limit(Number(pageSize));
    list = list.map(item => {
        item.id = item._id;
        return item;
    })
    if (from === 'admin') {
        return {
            list,
            pagination: {
                total: allList.length,
                pageSize,
                current: parseInt(`${currentPage}`, pageSize) || 1,
            },
        }
    }
    return list;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<IAdvertModel>) {
    return AdvertModel.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: object, newData: Advert, options: ModelUpdateOptions) {
    return AdvertModel.updateOne(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<IAdvertModel>) {
    const { deletedCount } = await AdvertModel.deleteOne(query);
    if (isNullOrUndefined(deletedCount) || (isNumber(deletedCount) && deletedCount < 1)) {
        outLogger.info(deletedCount)
        return Promise.reject('删除出错');
    }
    return;
}

/**
 * 新增
 * @param {object} query 
 * @param { Document }
 */
export const create = async function(data: Advert) {
    const Doc = new AdvertModel(data)
    return Doc.save();
}