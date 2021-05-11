import { BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class AutoOrderContractConfigEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column({type: 'varchar', length: 10})
    public symbol!: string;
    @Column()
    public buy_open!: number;
    @Column()
    public sell_close!: number;
    @Column()
    public sell_open!: number;
    @Column()
    public buy_close!: number;

    @Column()
    public lever_rate!: number;

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

    /**
     * 合约
     */
    @Column({type: 'boolean', nullable: true})
    public contract: boolean;

}
