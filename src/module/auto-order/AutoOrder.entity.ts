import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class Order extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({type: 'varchar', length: 10})
    public symbol!: string;
    @Column({type: 'varchar', length: 18})
    public sellAmountThreshold!: string;
    @Column({type: 'varchar', length: 18})
    public buyAmountThreshold!: string;
    @Column({type: 'varchar', length: 18})
    public buyStrengths!: string;
    @Column({type: 'varchar', length: 10})
    public sellStrengths!: string;
    @Column({type: 'varchar', length: 14})
    public buyGain!: string;
    @Column({type: 'varchar', length: 14})
    public sellGain!: string;
    @Column({type: 'tinyint'})
    public isUp!: number;
    @Column({type: 'tinyint'})
    public isFall!: number;
}