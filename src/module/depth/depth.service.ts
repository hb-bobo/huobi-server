import dayjs from 'dayjs';
import { getConnection, getRepository } from "typeorm";
import { errLogger } from "ROOT/common/logger";
import { DEFAULT_PAGE_SIZE } from "ROOT/constants/common";
import { entitysMap, tableNameFactory, DepthDTO } from "./depth.entity";

/**
 * 查询
 */
export const find = async function({start, end, symbol}) {
    const tableNames = tableNameFactory.queryWidthIntervalTime(start, end)
    const query = tableNames.map((name) => {
        return `
        SELECT
            *
        FROM ${name}
        WHERE time BETWEEN '${dayjs(start).format('YYYY/MM/DD H:mm:ss')}' AND '${dayjs(end).format('YYYY/MM/DD H:mm:ss')}'
        AND symbol='${symbol}'
        `
    })

    const res = await getConnection()
    .query(query.join('UNION ALL\n'))
    return res
}


/**
 * 新增
 */
export const create = async function(data: DepthDTO) {
    const repository = await getRepository(entitysMap[tableNameFactory.getTableName()])
    return repository.save(data);
}
