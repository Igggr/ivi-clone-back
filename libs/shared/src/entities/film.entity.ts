import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActorFilm } from './actor-film.entity';
import { Country } from './country.entity';
import { AgeRestriction } from './age-restriction';
import { Review } from './review.entity';
import { FilmGenre } from './film-genre.entity';
import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Film {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({
    description: 'Ссылка фильм на кинопоиске',
    example: 'https://www.kinopoisk.ru/film/301/',
  })
  @Column()
  url: string;

  @IsString()
  @ApiProperty({ description: 'Ссылка на preview' })
  @Column({ nullable: true })
  preview?: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Год вывуска', example: 1999 })
  @Column()
  year: number;

  @IsString()
  @ApiProperty({ description: 'Название фильма', example: 'Матрица' })
  @Column()
  title: string;

  @IsString()
  @ApiProperty({ description: 'Оригинальное название', example: 'Matrix' })
  @Column()
  originalTitle: string;

  @IsString()
  @ApiProperty({
    description: 'Слоган',
    example: '«Добро пожаловать в реальный мир»',
  })
  @Column()
  slogan: string;

  @ManyToOne(() => Country, (country) => country.filmsCreated)
  country: Country;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign Key', example: 1 })
  @Column()
  countryId: number;

  @OneToMany(() => ActorFilm, (personsInFilm) => personsInFilm.film)
  personsInFilm: ActorFilm[];

  @OneToMany(() => FilmGenre, (filmGenre) => filmGenre.film)
  filmGenres: FilmGenre[];

  @Column({ type: 'interval' })
  duration: string; // кривоватое хранение для интервала

  @ManyToOne(() => AgeRestriction, (restriction) => restriction.films)
  ageRestriction: AgeRestriction;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign Key', example: 1 })
  @Column()
  ageRestrictionId: number;

  @OneToMany(() => Review, (review) => review.film)
  reviews: Review[];
}
