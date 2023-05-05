import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Review, (review) => review.comments)
  review: Review;

  @Column()
  reviewId: number;

  @ManyToOne(() => Comment, (parent) => parent.childrens)
  parentComment?: Comment;

  @Column({ nullable: true })
  parentCommentId?: number;

  @OneToMany(() => Comment, (child) => child.parentComment, { nullable: true })
  childrens?: Comment[];

  @Column()
  profileId: number; // кажется profile - в другом сервисе

  @Column()
  text: string;
}
