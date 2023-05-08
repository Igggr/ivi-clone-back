import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';
import { FilmViewsCountry } from './film-views-country';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  countryName: string;

  @Column({ unique: true, nullable: false })
  url: string;

  @Column({ nullable: true })
  flag: string; // надо хранить UTF значок

  // вдруг есть любители индуского кино
  @OneToMany(() => Film, (film) => film.country)
  filmsCreated: Film[];

  @OneToMany(() => FilmViewsCountry, (view) => view.country)
  filmViews: FilmViewsCountry[];
}
