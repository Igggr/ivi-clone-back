import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FilmEntity } from "./film.entity";
import { FilmViewsCountry } from "./film-views-country";

export class CountryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    countryName: string;
    
    @Column()
    flag: string; // надо хранить UTF значок

    // вдруг есть любители индуского кино
    @OneToMany(() => FilmEntity, (film) => film.createdInCountry)
    filmsCreated: FilmEntity[];

    @OneToMany(() => FilmViewsCountry, (view) => view.country)
    filmViews: FilmViewsCountry[];
}