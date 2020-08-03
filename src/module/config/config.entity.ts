import {BaseEntity, Column, Entity, ObjectID, ObjectIdColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class ConfigEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public type!: string;

    @Column()
    public content!: string;
}