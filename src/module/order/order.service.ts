import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants";
import { SaveOptions } from "typeorm";
import { isNullOrUndefined, isNumber } from "util";
import OrderModel from "./order.entity";

/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object) {
    const res = await OrderModel.find({})
    return res;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<OrderModel>) {
    return OrderModel.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: Partial<OrderModel>, newData: Partial<OrderModel>, options?: SaveOptions) {
    return OrderModel.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<OrderModel>) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await OrderModel.remove(target);
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
export const create = async function(data: Partial<OrderModel>) {
    const Doc = OrderModel.create(data)
    return Doc.save();
}