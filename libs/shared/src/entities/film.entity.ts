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

@Entity()
export class Film {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  preview?: string;

  @Column()
  year: number;

  @Column()
  title: string;

  @Column()
  originalTitle: string;

  @Column()
  slogan: string;

  @ManyToOne(() => Country, (country) => country.filmsCreated)
  country: Country;

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

  @Column()
  ageRestrictionId: number;

  @OneToMany(() => Review, (review) => review.film)
  reviews: Review[];
}
