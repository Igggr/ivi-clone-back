import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';
import { FilmViewsCountry } from './film-views-country';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Country {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({ description: 'Название страны', example: 'США' })
  @Column({ unique: true, nullable: false })
  countryName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Ссылка на страну на кинопоиске',
    example: 'https://www.kinopoisk.ru/lists/movies/country--1/?b=films&b=top',
  })
  @Column({ unique: true, nullable: false })
  url: string;

  // вдруг есть любители индуского кино
  @OneToMany(() => Film, (film) => film.country)
  filmsCreated: Film[];

  @OneToMany(() => FilmViewsCountry, (view) => view.country)
  filmViews: FilmViewsCountry[];
}
