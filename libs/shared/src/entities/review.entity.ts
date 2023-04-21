import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column()
  isPositive: boolean; // вот из-за этого (и title) приходится выносить review и comment в рвзные таблицы

  @OneToMany(() => Comment, (comment) => comment.review)
  comments: Comment[];

  @Column()
  profileId: number; // кажется profile - в другом сервисе
}
