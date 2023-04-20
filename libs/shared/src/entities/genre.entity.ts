import { Column, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { FilmEntity } from "./film.entity";

export class GenreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    genre_name: string;

    @ManyToMany(() => FilmEntity, (film) => film.genres)
    films: FilmEntity[];
}
