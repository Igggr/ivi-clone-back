import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ActorFilm } from './actor-film.entity';
import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ActorRole {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @ApiProperty({
    description: 'Какова его роль в фильме',
    examples: ['actor', 'operator'],
  })
  @Column()
  roleName: string;

  // на случай если нам понадобиться найти всех режисеров
  @OneToMany(() => ActorFilm, (personFilm) => personFilm.role)
  personsInFilm: ActorFilm[];
}
