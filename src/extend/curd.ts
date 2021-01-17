import {BaseEntity, getRepository, SaveOptions } from "typeorm";
import pagination from "ROOT/common/pagination";
import { Pagination } from "ROOT/interface/List";
import { errLogger } from "ROOT/common/logger";
import { isNil } from "lodash";

export class CrudService<T extends any = any> {
    _Entity: any;
    constructor(Entity: T) {
        this._Entity = Entity;
    }
    /**
     * Get one
     * @param query
     */
    // public getOne = async <T>(query) => {
    //     const res = await this._Entity.findOne<T>(query)
    //     return res;
    // }
    
    /**
     * Get many
     * @param {object} query 
     */
    public getMany = async (query: Partial<T> = {}, paginationOption?: Pagination) => {
        const {skip, take, current} = pagination(paginationOption);
        const [list, total] = await getRepository(this._Entity)
        .createQueryBuilder()
        .skip(skip)
        .take(take)
        .getManyAndCount();

        return {
            list: list.map((item: any) => {
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
    }
    /**
     * 更新单个
     * @param {object} query 
     * @param { Document }
     */
    public updateOne = async (query: Partial<T>, newData: Partial<T>, options?: SaveOptions) => {
        return this._Entity.update(query, newData, options);
    }
    /**
     * 删除单个
     * @param {object} query 
     * @param { Document }
     */
    public deleteOne = async (query: Partial<T>) => {
        const target = await this._Entity.findOne(query);
        if (!target) {
            return Promise.reject('删除出错');
        }
        const deleted = await this._Entity.remove(target);
        if (isNil(deleted)) {
            errLogger.info(query)
            return Promise.reject('删除出错');
        }
        return;
    }

    /**
     * 新增
     * @param {object} query 
     * @param { Document }
     */
    public create = async (data: Partial<T>) => {
        // if (data._id) {      
        //     const queryData = await this._Entity.findOne({_id: data._id});
        //     if (queryData) {
        //         throw Error(`${data} 已存在`);
        //     }
        // }
        const Doc = this._Entity.create(data);
        return Doc.save();
    }
}