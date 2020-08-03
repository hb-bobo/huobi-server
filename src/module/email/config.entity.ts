import {BaseEntity, Column, Entity, ObjectID, ObjectIdColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export default class MailEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public mail!: string;

}