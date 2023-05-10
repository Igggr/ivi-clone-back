import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { Film } from './film.entity';
import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Review {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({ description: 'Ссылка на ревью на кинопоиске' })
  @Column()
  url: string;

  @IsString()
  @ApiProperty({ description: 'Название ревью' })
  @Column()
  title: string;

  @IsString()
  @ApiProperty({ description: 'Текст ревью' })
  @Column()
  text: string;

  @Column({ nullable: true })
  isPositive: boolean; // вот из-за этого (и title) приходится выносить review и comment в рвзные таблицы

  @OneToMany(() => Comment, (comment) => comment.review)
  comments: Comment[];

  @ManyToOne(() => Film, (film) => film.reviews)
  film: Film;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  filmId: number;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  profileId: number; // profile в другом сервисе - связи нет
}
