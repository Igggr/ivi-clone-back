import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActorFilm } from './actor-film.entity';
import { Genre } from './genre.entity';
import { Country } from './contry.entity';
import { AgeRestriction } from './age-restriction';
import { Review } from './review.entity';

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

  @JoinTable()
  @ManyToMany(() => Genre, (genre) => genre.films)
  genres: Genre[];

  @Column({ type: 'interval' })
  duration: string; // кривоватое хранение для интервала

  @OneToMany(() => AgeRestriction, (restriction) => restriction.films)
  ageRestriction: AgeRestriction;

  @Column()
  ageRestrictionId: number;

  @OneToMany(
    () => Review,
    (review) => review.film
  )
  reviews: Review[];
}
