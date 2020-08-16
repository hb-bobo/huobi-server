import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

const PriceMaxColumnType = {type: 'float' as 'float'}
@Entity()
export default class TradeEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;
    @Column()
    public symbol!: string;
    @Column(PriceMaxColumnType)
    public buy!: number;
    @Column(PriceMaxColumnType)
    public sell!: number;
    @Column()
    public time!: number;
}