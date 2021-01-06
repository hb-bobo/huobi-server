"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.findOne = exports.find = void 0;
const config_1 = __importDefault(require("config"));
const crypto_1 = __importDefault(require("crypto"));
const user_entity_1 = __importDefault(require("./user.entity"));
const sign = config_1.default.get('sign');
/**
 * 查询
 * @param {object} query
 */
async function find(query) {
    const res = await user_entity_1.default.find(query);
    return res;
}
exports.find = find;
/**
 * 查询单个
 * @param {object} query
 */
async function findOne(query) {
    return user_entity_1.default.findOne(query);
}
exports.findOne = findOne;
/**
 * 创建用户
 * @param {string} user
 * @param {string} password
 * @param {'admin' | 'user'}
 */
async function create(user, password, role) {
    const res = await user_entity_1.default.find({ user });
    if (res.length !== 0) {
        throw Error('用户已存在');
    }
    const pass = crypto_1.default.createHmac('md5', sign)
        .update(password)
        .digest('hex');
    const newUser = user_entity_1.default.create({ user, password: pass, role });
    return newUser.save();
}
exports.create = create;
