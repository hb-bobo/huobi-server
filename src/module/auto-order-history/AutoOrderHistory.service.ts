
import AutoOrderHistory from "./AutoOrderHistory.entity";
import { CrudService } from 'ROOT/extend/curd';
import { SaveOptions } from "typeorm";

// export class AutoOrderHistoryService extends CrudService<AutoOrderHistory>{

// }
// export default new AutoOrderHistoryService(AutoOrderHistory);

/**
 * 查询
 * @param {object} query
 */
export const find = async function(query: Record<string, any>) {
    const res = await AutoOrderHistory.find(query)
    return res;
}


/**
 * 更新单个
 * @param {object} query
 * @param { Document }
 */
export const updateOne = async function(query: Partial<AutoOrderHistory>, newData: Partial<AutoOrderHistory>, options?: SaveOptions) {
    return AutoOrderHistory.update(query, newData, options);
}

/**
 * 新增
 * @param {object} query
 * @param { Document }
 */
export const create = async function(data: Partial<AutoOrderHistory>) {
    const Doc = AutoOrderHistory.create(data)
    return Doc.save();
}
