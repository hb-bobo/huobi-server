import { DEFAULT_PAGE_SIZE } from "APP/constants";
import { DeviceTag } from "APP/interface/Device";
import { ModelUpdateOptions } from "mongoose";
import DeviceTagModel from "./device-tag.model";



/**
 * 查询
 */
export const find = async function() {
    const allList = await DeviceTagModel.find({})
    return allList;
}

/**
 * 查询单个
 */
export const findOne = async function(query: Partial<DeviceTag>) {
    return DeviceTagModel.findOne(query);
}

/**
 * 更新单个
 * @param { Document }
 */
export const updateOne = async function(query: object, newData: DeviceTag, options: ModelUpdateOptions) {
    return DeviceTagModel.updateOne(query, newData, options);
}

/**
 * 更新单个
 */
export const deleteOne = async function(query: Partial<DeviceTag>) {
    return DeviceTagModel.deleteOne(query);
}

/**
 * 新增
 */
export const create = async function(data: DeviceTag) {
    const Doc = new DeviceTagModel(data)
    return Doc.save();
}