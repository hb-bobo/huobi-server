import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class AutoOrderHistoryEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public userId!: number;

    @Column({type: 'varchar', length: 10})
    public symbol!: string;
    @Column({type: 'float'})
    public price!: number;
    @Column({type: 'float'})
    public amount!: number;
    @Column({type: 'varchar', length: 4})
    public type!: string;
    @Column({type: 'datetime'})
    public datetime!: Date;
    @Column({type: 'int'})
    public status!: number;
    @Column()
    public row?: string;

    @Column()
    public clientOrderId?: string;

    @Column({type: 'varchar', length: 8})
    public state?: string;

}
