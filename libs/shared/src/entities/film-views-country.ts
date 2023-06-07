import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Country } from './country.entity';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Film } from './film.entity';

@Entity()
export class FilmViewsCountry {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Country, (country) => country.filmViews)
  country: Country;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  countryId: number;

  @ManyToOne(() => Film, (film) => film.views)
  film: Film;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  filmId: number;

  @ApiProperty({ description: 'Дата премьеры' })
  premiere_date: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Где состоялась премьера фильма в данной стране',
    example: 'Кинофестиваль в Лос-Анджелесе',
  })
  @Column({ nullable: true })
  premiere_place?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({
    description: 'Число просмотров в данной стране',
    example: '2 142 550 чел.',
  })
  @Column({ nullable: false })
  viewersCount?: string;
}
