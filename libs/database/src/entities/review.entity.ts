import { NumberLiteralTypeAnnotation } from "@babel/types";
import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CommentEntity } from "./comment.entity";

export class ReviewEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    text: string;

    @Column()
    isPositive: boolean;  // вот из-за этого (и title) приходится выносить review и comment в рвзные таблицы

    @OneToMany(() => CommentEntity, (comment) => comment.review)
    comments: CommentEntity[];

    @Column()
    profileId: number;  // кажется profile - в другом сервисе
}