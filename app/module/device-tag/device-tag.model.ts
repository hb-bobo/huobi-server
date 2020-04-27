import { DeviceTag } from "APP/interface/Device";
import {Document, Schema} from "mongoose";
import mongoose from '../../db';

export interface IDeviceTagModel extends DeviceTag, Document {
    name: string;
}
const DeviceTagSchema = new Schema({
    name: String,
}, { collection: 'DeviceTag', versionKey: false})  // 需要加上collection指定表名，不然查出的数据是[]，mongoose的梗

const DeviceTagModel = mongoose.model<IDeviceTagModel>('DeviceTag', DeviceTagSchema);

export default DeviceTagModel;