import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Genre {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({
    description: 'Ссылка на жанр кинопоиске',
    example:
      'https://www.kinopoisk.ru/lists/movies/genre--comedy/?b=films&b=top',
  })
  @Column({ unique: true })
  url: string;

  @IsString()
  @ApiProperty({ description: 'Название жанра', example: 'Комедия' })
  @Column({ unique: true })
  genreName: string;

  @IsString()
  @ApiProperty({ description: 'Genre title', example: 'Comedy ' })
  @Column({ nullable: true })
  genreNameEn: string;
}
