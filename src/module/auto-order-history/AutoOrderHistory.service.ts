
import AutoOrderHistory from "./AutoOrderHistory.entity";
import { CrudService } from 'ROOT/extend/CURD';
import { getRepository, SaveOptions } from "typeorm";
import { TRADE_STATUS } from "ROOT/constants/huobi";
import pagination from "ROOT/common/pagination";
import { Pagination } from "ROOT/interface/List";

// export class AutoOrderHistoryService extends CrudService<AutoOrderHistory>{

// }
// export default new AutoOrderHistoryService(AutoOrderHistory);
/**
 * 查询
 * @param {object} query
 */
export const find = async function(query: Partial<AutoOrderHistory> = {}, paginationOption?: Pagination) {
    const {skip, take, current} = pagination(paginationOption);
    const [list, total] = await getRepository(AutoOrderHistory)
    .createQueryBuilder("FeedbackEntity")
    .where({userId: query.userId})
    .orderBy('date')
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
    data.status = TRADE_STATUS.wait;
    const Doc = AutoOrderHistory.create(data)
    return Doc.save();
}
