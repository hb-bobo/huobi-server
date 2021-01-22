import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    EntitySchema
} from "typeorm";
import { SplitTableWithYear } from "ROOT/extend/SplitTableWithYear";
import { outLogger } from "ROOT/common/logger";

export const tableNameFactory = new SplitTableWithYear("depth_entity");

export interface DepthDTO {
    symbol: string;

    price: number;
    usdtPrice: number;
    time: Date;

    exchange: number;

    bids_max_1: number;

    bids_max_2: number;

    asks_max_1: number;

    asks_max_2: number;

    sell_1: number;

    sell_2: number;

    buy_1: number;

    buy_2: number;

    bids_max_price: string;

    asks_max_price: string;
}
export const entitysMap: Record<string, EntitySchema<DepthDTO>> = {};

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

            price: {
                type: "float"
            },
            usdtPrice: {
                type: "float"
            },
            time: {
                type: 'datetime'
            },

            exchange: {
                type: "int"
            },

            bids_max_1: {
                type: "float"
            },

            bids_max_2: {
                type: "float"
            },

            asks_max_1: {
                type: "float"
            },

            asks_max_2: {
                type: "float"
            },

            sell_1: {
                type: "float"
            },

            sell_2: {
                type: "float"
            },

            buy_1: {
                type: "float"
            },

            buy_2: {
                type: "float"
            },

            bids_max_price: {
                type: String
            },

            asks_max_price: {
                type: String
            }
        }
    });
    return entitysMap[name];
}
createEntitySchema();

// 每天检测一次
setInterval(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    if (entitysMap[nextDate.getFullYear()] === undefined) {
        createEntitySchema();
    }
}, 86400000);

/* const PriceMaxColumnType = {type: 'float' as 'float'}
@Entity()
export default class DepthEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id?: number;

    @Column()
    public symbol!: string;

    @Column({type: 'float'})
    public price!: number;

    @Column({type: 'datetime'})
    public datetime!: Date;

    @Column({type: 'int'})
    public exchange!: number;

    @Column(PriceMaxColumnType)
    public bids_max_1!: number;

    @Column(PriceMaxColumnType)
    public bids_max_2!: number;

    @Column(PriceMaxColumnType)
    public asks_max_1!: number;

    @Column(PriceMaxColumnType)
    public asks_max_2!: number;

    @Column(PriceMaxColumnType)
    public sell_1!: number;

    @Column(PriceMaxColumnType)
    public sell_2!: number;

    @Column(PriceMaxColumnType)
    public buy_1!: number;

    @Column(PriceMaxColumnType)
    public buy_2!: number;

    @Column({type: 'varchar', length: 22})
    public bids_max_price!: string;

    @Column({type: 'varchar', length: 22})
    public asks_max_price?: string;
}
export type DepthEntityData = Omit<DepthEntity, keyof BaseEntity | 'reload'>;

 */
