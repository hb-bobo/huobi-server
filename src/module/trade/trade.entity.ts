import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

const PriceMaxColumnType = {type: 'float' as 'float'}
@Entity()
export default class TradeEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public symbol!: string;

    @Column({type: 'float'})
    public price!: string;

    @Column()
    public time!: number;

    @Column({type: 'varchar', length: 10})
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
    public bids_max_price!: number;

    @Column({type: 'varchar', length: 22})
    public asks_max_price!: number;
}