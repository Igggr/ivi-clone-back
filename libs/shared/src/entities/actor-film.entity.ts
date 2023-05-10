import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';
import { Actor } from './actor.entity';
import { ActorRole } from './actor-role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

@Entity()
export class ActorFilm {
  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Film, (film) => film.personsInFilm)
  film: Film;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  filmId: number;

  // можно сомещать несколько должностей в фильме
  @ManyToOne(() => Actor, (person) => person.personInFilm)
  actor: Actor;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Первичный ключ', example: 1 })
  @Column()
  actorId: number;

  @ManyToOne(() => ActorRole, (actorRole) => actorRole.personsInFilm)
  role: ActorRole;

  @IsInt()
  @IsPositive()
  @ApiProperty({ description: 'Foreign key', example: 1 })
  @Column()
  roleId: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Примечание по роли',
    examples: ['... дворецкий', '... по костюмам'],
  })
  @Column()
  roleNotes: string;
}
