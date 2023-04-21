import { NumberLiteralTypeAnnotation } from "@babel/types";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilm } from "./actor-film.entity";
import { Genre } from "./genre.entity";
import { Country } from "./contry.entity";
import { DateTime } from "luxon";
import { IPostgresInterval } from 'postgres-interval';


@Entity()
export class Film {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column()
    year: number;
        
    @Column()
    title: string;

    @Column()
    originalTitle: string;

    @Column()
    slogan: string;

    @ManyToOne(() => Country, (country) => country.filmsCreated)
    createdInCountry: Country;

    @Column()
    countryId: number;

    @OneToMany(() => ActorFilm, (personsInFilm) => personsInFilm.film)
    personsInFilm: ActorFilm[];

    @JoinTable()
    @ManyToMany(() => Genre, (genre) => genre.films)
    genres: Genre[];

    @Column({type: 'interval'})
    duration: IPostgresInterval;
}