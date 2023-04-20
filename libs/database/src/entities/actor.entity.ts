import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilmEntity } from "./actor-film.entity";

export class ActorEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({unique: true})
    url: string;

    @Column()
    photo: string;

    @OneToMany(() => ActorFilmEntity, (personInFilm) => personInFilm.person)
    personInFilm: ActorFilmEntity[];
}