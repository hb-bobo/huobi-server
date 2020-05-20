import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export default class WatchEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({type: 'varchar'})
    public symbol!: string ;
}