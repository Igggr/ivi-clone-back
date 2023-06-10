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
  @ApiProperty({
    description: 'Ссылка на ревью на кинопоиске',
    example: 'https://www.kinopoisk.ru/user/15854772/comment/3251114/',
  })
  @Column({ nullable: true })
  url?: string;

  @IsString()
  @ApiProperty({
    description: 'Название ревью',
    example: 'История о том, как на лжи можно заработать миллионы',
  })
  @Column()
  title: string;

  @IsString()
  @ApiProperty({
    description:
      'Фильм «„Волк с Уолл-стрит“» — привлекательный, завораживающий, но жестокий и контроверсиальный фильм ...',
  })
  @Column()
  text: string;

  @Column({ nullable: true })
  isPositive?: boolean; // вот из-за этого (и title) приходится выносить review и comment в разные таблицы

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
