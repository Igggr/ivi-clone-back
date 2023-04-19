import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PersonFilmEntity } from "./person-film.entity";

export class PersonEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({unique: true})
    url: string;

    @Column()
    photo: string;

    @OneToMany(() => PersonFilmEntity, (personInFilm) => personInFilm.person)
    personInFilm: PersonFilmEntity[];
}