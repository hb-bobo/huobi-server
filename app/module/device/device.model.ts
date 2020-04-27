import { Device } from 'APP/interface/Device';
import {Document, Schema, Types} from "mongoose";
import mongoose from '../../db';

export interface IDeviceModel extends Device, Document {

}
const DeviceSchema = new Schema({
    name: String,
    ip: String,
    address: String, // 详细地址
    location: String, // 坐标点
    status: Number, // 状态
    lastUpdater: String, // 最近一次更新人
    lastResponsesTime: Number, // 最近一次回复时间
    screenshot: String, // 截屏url
    tag: [{ type: Types.ObjectId, ref: 'DeviceTag'}], // 组
    adGroup:  [{ type: Types.ObjectId, ref: 'Advert'}], // 广告组
}, { collection: 'Device', versionKey: false})  // 需要加上collection指定表名，不然查出的数据是[]，mongoose的梗


const DeviceModel = mongoose.model<IDeviceModel>('Device', DeviceSchema);

export default DeviceModel;