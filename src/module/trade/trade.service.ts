import dayjs from 'dayjs';
import { getRepository, getConnection, EntityManager  } from "typeorm";
import isNil from "lodash/isNil";
import { errLogger } from "ROOT/common/logger";
import { entitysMap, tableNameFactory, TradeDTO, createEntitySchema } from './trade.entity'

/**
 * 查询
 * @param {object} query 
 */
export const find = async function({start, end, symbol}) {
    const tableNames = tableNameFactory.queryWidthIntervalTime(start, end)

    let query = tableNames.map((name) => {
        return `
        SELECT * FROM ${name}
        WHERE time BETWEEN '${dayjs(start).format('YYYY/MM/DD H:mm:ss')}' AND '${dayjs(end).format('YYYY/MM/DD H:mm:ss')}'
        AND symbol='${symbol}'
        `
    })
    const res = await getConnection()
    .query(query.join('UNION ALL\n'))
    
    // let res: TradeDTO[] = []
    // const res = await getConnection()
    //     .getRepository<TradeDTO>(tableNames[0])
    //     .createQueryBuilder('trade')        
    //     .addFrom(tableNames[1], tableNames[1]).getMany()
    // for (let i = 0; i < tableNames.length; i++) {
    //     const tableName = tableNames[i];
    //     if (entitysMap[tableName] === undefined) {
    //         createEntitySchema(tableName);
    //     }
    //     const list = await getManager()
    //     .getRepository<TradeDTO>(entitysMap[tableName])
    //     .createQueryBuilder('trade')        
    //     .from
    //     .where('trade.time BETWEEN :start AND :end', {start, end})
    //     .andWhere('trade.symbol = :symbol', {symbol})
    //     .getMany();
    //     res = res.concat(list)
    // }
    return res;
}


/**
 * 新增
 */
export const create = async function(data: TradeDTO) {

    const repository = await getRepository(entitysMap[tableNameFactory.getTableName()])
    return repository.save(data);
}