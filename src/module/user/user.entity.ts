import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class UserEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public user!: string;

    @Column()
    public password!: string;

    @Column()
    public role!: number;
}