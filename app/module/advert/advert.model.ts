
import { outLogger } from 'APP/common/logger';
import { Advert } from 'APP/interface/Advert';
import {Document, Schema, Types} from "mongoose";
import mongoose from '../../db';

export interface IAdvertModel extends Advert, Document {

}
const AdvertSchema = new Schema({
    title: String,
    download: String,
    // status: String,
    percent: Number,
    // cover: String,
    updatedAt: Number,
    createdAt: Number,
    // onlineDate: [Number, Number],
    subDescription: String,
    activeUser: { type: Types.ObjectId, ref: 'Users'},
    // online: Boolean, // 是否上线
}, { collection: 'Advert', versionKey: false})  // 需要加上collection指定表名，不然查出的数据是[]，mongoose的梗

AdvertSchema.pre<IAdvertModel>('save', function (next) {
    if (!this.createdAt) {
        this.createdAt = Date.now();
    }
    next();
});
AdvertSchema.pre<IAdvertModel>('updateOne', function (next) {
    if (!this.updatedAt) {
        this.updatedAt = Date.now();
    }
    next();
});
const AdvertModel = mongoose.model<IAdvertModel>('Advert', AdvertSchema);

export default AdvertModel;