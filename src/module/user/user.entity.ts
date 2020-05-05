import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public user!: string;

    @Column()
    public password!: string;
}