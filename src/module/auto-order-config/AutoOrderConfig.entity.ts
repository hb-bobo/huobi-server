import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


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
}
