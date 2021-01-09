import { EntitySchema, EntityManager, getConnection} from "typeorm";
import { SplitTableWithYear } from "ROOT/common/SplitTableWithYear";
import { outLogger } from "ROOT/common/logger";

export const tableNameFactory = new SplitTableWithYear('trade_history_entity')
export interface TradeDTO {
    symbol: string;
    buy: string;
    sell: string;
    time: Date;
    usdtPrice: string;
}
export const entitysMap: Record<string, EntitySchema<TradeDTO>> = {}

export function createEntitySchema(name?: string) {
    name = name === undefined ? tableNameFactory.getTableName() : name;
    if (entitysMap[name]) {
        return;
    }

    entitysMap[name] = new EntitySchema({
        name: name,
        columns: {
            id: {
                type: Number,
                primary: true,
                generated: true
            },
            symbol: {
                type: String
            },
            buy: {
                type: 'float',
                default: 0.0
            },
            sell: {
                type: 'float',
                default: 0.0
            },
            usdtPrice: {
                type: 'float',
                default: 0.0
            },
            time: {
                type: Date
            }
        }
    });
    return entitysMap[name];
}
createEntitySchema()

// 每天检测一次
setInterval(() => {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + 2)
    if (entitysMap[nextDate.getFullYear()] === undefined) {
        createEntitySchema()
    }
}, 86400000)
