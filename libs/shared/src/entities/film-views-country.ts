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

  @ApiProperty({ description: 'Дата примьеры' })
  @Column()
  premiere_date: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Где состоялась премьера' })
  @Column({ nullable: true })
  premiere_place?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty({ description: 'Число просмотров' })
  @Column({ nullable: false })
  viewersCount?: number;
}
