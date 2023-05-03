import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { Profile } from './profile.entity';
import { Film } from './film.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column({nullable: true})
  isPositive: boolean; // вот из-за этого (и title) приходится выносить review и comment в рвзные таблицы

  @OneToMany(() => Comment, (comment) => comment.review)
  comments: Comment[];

  @ManyToOne(() => Film, (film) => film.reviews)
  film: Film;

  @Column()
  filmId: number;

  @Column()
  profileId: number; // кажется profile - в другом сервисе
}
