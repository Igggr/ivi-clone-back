import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilm } from "./actor-film.entity";

@Entity()
export class Actor {  // не только актер, всякий кто участвовал в создании фильма - режисеры, операторы, озвучка ...
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

    @OneToMany(() => ActorFilm, (personInFilm) => personInFilm.actor)
    personInFilm: ActorFilm[];
}