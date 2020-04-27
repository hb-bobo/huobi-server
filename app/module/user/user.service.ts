

import config from 'config';
import crypto from 'crypto';
// import jwt from 'jsonwebtoken';
// import { Types } from "mongoose";
import UserModel from './user.model';

const sign = config.get<string>('sign');
/**
 * 创建用户
 * @param {string} user 
 * @param {string} password 
 * @param {'admin' | 'user'}
 */
export async function create(user: string, password: string, authority?: 'admin' | 'user') {
    const res = await UserModel.find({user});
    if (res.length !== 0) {
        throw Error('用户已存在');
    }
    const pass = crypto.createHmac('md5', sign)
                   .update(password)
                   .digest('hex');
    const Doc = new UserModel({user, password: pass, authority});
    return Doc.save();
}
