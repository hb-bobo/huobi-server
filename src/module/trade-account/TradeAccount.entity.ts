import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class TradeAccount extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({type: 'varchar', length: 10})
    public exchange!: string;
    @Column({type: 'varchar', length: 64})
    public access_key!: string;
    @Column({type: 'varchar', length: 64})
    public secret_key!: string;
    @Column({type: 'varchar', length: 32})
    public uid!: string;
    @Column({type: 'varchar', length: 10})
    public account_id_pro!: string;
    @Column({type: 'varchar', length: 14})
    public trade_password!: string;
}