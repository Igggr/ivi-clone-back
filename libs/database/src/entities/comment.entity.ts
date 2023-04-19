import { Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ReviewEntity } from "./review.entity";

export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ReviewEntity, (review) => review.comments)
    review: ReviewEntity;

    @Column()
    reviewId: number;

    @ManyToOne(() => CommentEntity, (parent) => parent.childrens)
    parentComment?: CommentEntity;

    @Column({ nullable: true })
    parentCommentId?: number;

    @OneToMany(() => CommentEntity, (child) => child.parentComment, { nullable: true })
    childrens?: CommentEntity[];

    @Column()
    profileId: number;  // кажется profile - в другом сервисе

    @Column()
    text: string;
}