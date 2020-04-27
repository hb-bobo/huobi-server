import { DEFAULT_PAGE_SIZE } from "APP/constants";
import { Device } from "APP/interface/Device";
import { ModelUpdateOptions, Types } from "mongoose";
import DeviceModel, { IDeviceModel } from "./device.model";



/**
 * 查询
 * @param {object} query 
 */
export const find = async function(query: object, { currentPage = 1, pageSize = DEFAULT_PAGE_SIZE }) {
    const allList = await DeviceModel.find({})
    const list = await DeviceModel.find(query, null, {skip: (currentPage - 1) * pageSize}).limit(Number(pageSize));
    const data = {
        list,
        pagination: {
            total: allList.length,
            pageSize,
            current: parseInt(`${currentPage}`, pageSize) || 1,
        },
    }
    return data;
}

/**
 * 查询单个
 * @param {object} query 
 */
export const findOne = async function(query: Partial<IDeviceModel>) {
    return DeviceModel.findOne(query);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const updateOne = async function(query: object, newData: Device, options: ModelUpdateOptions) {
    return DeviceModel.updateOne(query, newData, options);
}

/**
 * 更新单个
 * @param {object} query 
 * @param { Document }
 */
export const deleteOne = async function(query: Partial<IDeviceModel>) {
    return DeviceModel.deleteOne(query);
}

/**
 * 新增
 * @param {object} query 
 * @param { Document }
 */
export const create = async function(data: Device) {
    const Doc = new DeviceModel(data)
    return Doc.save();
}