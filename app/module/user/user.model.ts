import { User } from 'APP/interface/User'
import {Document, Model, model, Schema} from "mongoose";
import mongoose from '../../db';

export interface IUserModel extends  User,Document{
    
}
const UserSchema = new Schema({
    user: String,
    password: String,
    authority: String,
}, { collection: 'Users', versionKey: false})  // 需要加上collection指定表名，不然查出的数据是[]，mongoose的梗

const UserModel = mongoose.model<IUserModel>('Users', UserSchema);

export default UserModel;