import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

@Entity()
export class AgeRestriction {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({
    description: 'Ссылка на возрастное ограничение на кинопоиске',
    example: 'https://www.kinopoisk.ru/film/462682/rn/R/',
  })
  @Column({ unique: true })
  url: string;

  @IsString()
  @ApiProperty({
    description: 'Буквенная аббревиатура возрастного ограничения',
    example: 'R',
  })
  @Column()
  abbreviation: string;

  // возможно надо перенести в film или в отдельную таблицу -  кажется, что есть 2 разных рейтинга (м.б. русский и американский?)
  // но пока не станет ясно, что перенносить точно надо - пусть будет здесь. По смыслуэто все же ограничение
  @IsString()
  @ApiProperty({ description: 'Минимальный возраст зрителя', example: '16+' })
  @Column()
  minAge: string;

  @IsString()
  @ApiProperty({
    description: 'Описание ограничения по возрасту',
    example: 'Детям до 17 лет обязательно присутствие родителей',
  })
  @Column()
  description: string;

  // @Column()
  // fullDescription: string;

  @OneToMany(() => Film, (film) => film.ageRestriction)
  films: Film[];
}
