import { NumberLiteralTypeAnnotation } from "@babel/types";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilmEntity } from "./actor-film.entity";
import { GenreEntity } from "./genre.entity";
import { CountryEntity } from "./contry.entity";
import { DateTime } from "luxon";
import { IPostgresInterval } from 'postgres-interval';


@Entity()
export class FilmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: number;

    @Column()
    year: number;
        
    @Column()
    title: string;

    @Column()
    originalTitle: string;

    @Column()
    slogan: string;

    @ManyToOne(() => CountryEntity, (country) => country.filmsCreated)
    createdInCountry: CountryEntity;

    @Column()
    countryId: number;

    @OneToMany(() => ActorFilmEntity, (personsInFilm) => personsInFilm.film)
    personsInFilm: ActorFilmEntity[];

    @JoinTable()
    @ManyToMany(() => GenreEntity, (genre) => genre.films)
    genres: GenreEntity[];

    @Column({type: 'interval'})
    duration: IPostgresInterval;
}