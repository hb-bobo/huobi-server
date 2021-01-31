"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntitySchema = exports.entitysMap = exports.tableNameFactory = void 0;
const typeorm_1 = require("typeorm");
const SplitTableWithYear_1 = require("../../extend/SplitTableWithYear");
exports.tableNameFactory = new SplitTableWithYear_1.SplitTableWithYear("depth_entity");
exports.entitysMap = {};
function createEntitySchema(name) {
    name = name === undefined ? exports.tableNameFactory.getTableName() : name;
    if (exports.entitysMap[name]) {
        return;
    }
    exports.entitysMap[name] = new typeorm_1.EntitySchema({
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
    return exports.entitysMap[name];
}
exports.createEntitySchema = createEntitySchema;
createEntitySchema();
// 每天检测一次
setInterval(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    if (exports.entitysMap[nextDate.getFullYear()] === undefined) {
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
