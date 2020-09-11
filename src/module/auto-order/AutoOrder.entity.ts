import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class AutoOrderEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;
    @Column({type: 'varchar', length: 10})
    public user!: string;

    @Column({type: 'varchar', length: 10})
    public symbol!: string;
    @Column({type: 'varchar', length: 10})
    public exchange!: string;
    @Column({type: 'float'})
    public amount!: string;
    @Column({type: 'float'})
    public money!: string;
    @Column({type: 'float'})
    public price!: string;

    @Column({type: 'int'})
    public sellCount!: string;
    @Column({type: 'int'})
    public buyCount!: string;
    
    @Column({type: 'int'})
    public period!: string;

    @Column({type: 'tinyint'})
    public forceTrade!: number;
}