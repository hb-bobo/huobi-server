import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants";
import { SaveOptions } from "typeorm";
import { isNullOrUndefined, isNumber } from "util";
import DepthModel, {DepthEntityData} from "./depth.entity";

export { DepthEntityData } from "./depth.entity";
/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object) {
    const res = await DepthModel.find({})
    return res;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: DepthEntityData) {
    return DepthModel.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: DepthEntityData, newData: DepthEntityData, options?: SaveOptions) {
    return DepthModel.update(query, newData, options);
}

/**
 * 删除单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: DepthEntityData) {
    const target = await findOne(query);
    if (!target) {
        return Promise.reject('删除出错');
    }
    const deleted = await DepthModel.remove(target);
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
export const create = async function(data: DepthEntityData) {
    const Doc = DepthModel.create(data)
    return Doc.save();
}