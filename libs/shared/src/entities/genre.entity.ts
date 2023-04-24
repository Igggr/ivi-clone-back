import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  genreName: string;

  @Column({ nullable: true })
  genreNameEn: string;

  @ManyToMany(() => Film, (film) => film.genres)
  films: Film[];
}
