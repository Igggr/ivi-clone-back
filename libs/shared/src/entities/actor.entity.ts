import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilmEntity } from "./actor-film.entity";

export class ActorEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    url: string; // ссылка на профиль на сайте кинопоиск

    @Column()
    fullName: string;

    @Column()
    fullName_en: string

    @Column()
    photo: string;

    @OneToMany(() => ActorFilmEntity, (personInFilm) => personInFilm.actor)
    personInFilm: ActorFilmEntity[];
}