

import config from 'config';
import crypto from 'crypto';
import { User } from 'ROOT/interface/User';
import UserEntity from './user.entity';

const sign = config.get<string>('sign');


/**
 * 查询
 * @param {object} query 
 */
export async function find(query?: Partial<UserEntity>) {
    const res = await UserEntity.find(query)
    return res;
}

/**
 * 查询单个
 * @param {object} query 
 */
export async function findOne(query: Partial<UserEntity>) {
    return UserEntity.findOne(query);
}
/**
 * 创建用户
 * @param {string} user 
 * @param {string} password 
 * @param {'admin' | 'user'}
 */
export async function create(user: string, password: string, role?: User['role']) {
    const res = await UserEntity.find({user});
    if (res.length !== 0) {
        throw Error('用户已存在');
    }
    const pass = crypto.createHmac('md5', sign)
                   .update(password)
                   .digest('hex');
    const newUser = UserEntity.create({user, password: pass, role})
    return newUser.save();
}
