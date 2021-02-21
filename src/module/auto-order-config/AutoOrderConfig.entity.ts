import { BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class AutoOrderConfigEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column({type: 'varchar', length: 10})
    public symbol!: string;
    @Column({type: 'float'})
    public buy_usdt!: number;
    @Column({type: 'float'})
    public sell_usdt!: number;

    @Column({type: 'varchar', length: 10})
    public period!: string;

    @Column({type: 'float'})
    public oversoldRatio: number;
    @Column({type: 'float'})
    public overboughtRatio: number;
    @Column({type: 'float'})
    public sellAmountRatio: number;
    @Column({type: 'float'})
    public buyAmountRatio: number;




}
