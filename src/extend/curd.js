"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudService = void 0;
const typeorm_1 = require("typeorm");
const pagination_1 = __importDefault(require("../common/pagination"));
const logger_1 = require("../common/logger");
const lodash_1 = require("lodash");
class CrudService {
    constructor(Entity) {
        /**
         * Get one
         * @param query
         */
        this.getOne = async (query) => {
            const res = await this._Entity.findOne(query);
            return res;
        };
        /**
         * Get many
         * @param {object} query
         */
        this.getMany = async (query = {}, paginationOption) => {
            const { skip, take, current } = pagination_1.default(paginationOption);
            const [list, total] = await typeorm_1.getRepository(this._Entity)
                .createQueryBuilder()
                .skip(skip)
                .take(take)
                .getManyAndCount();
            return {
                list: list.map((item) => {
                    return {
                        ...item,
                    };
                }),
                pagination: {
                    current,
                    pageSize: take,
                    total,
                }
            };
        };
        /**
         * 更新单个
         * @param {object} query
         * @param { Document }
         */
        this.updateOne = async (query, newData, options) => {
            return this._Entity.update(query, newData, options);
        };
        /**
         * 删除单个
         * @param {object} query
         * @param { Document }
         */
        this.deleteOne = async (query) => {
            const target = await this._Entity.findOne(query);
            if (!target) {
                return Promise.reject('删除出错');
            }
            const deleted = await this._Entity.remove(target);
            if (lodash_1.isNil(deleted)) {
                logger_1.errLogger.info(query);
                return Promise.reject('删除出错');
            }
            return;
        };
        /**
         * 新增
         * @param {object} query
         * @param { Document }
         */
        this.create = async (data) => {
            // if (data._id) {      
            //     const queryData = await this._Entity.findOne({_id: data._id});
            //     if (queryData) {
            //         throw Error(`${data} 已存在`);
            //     }
            // }
            const Doc = this._Entity.create(data);
            return Doc.save();
        };
        this._Entity = Entity;
    }
}
exports.CrudService = CrudService;
