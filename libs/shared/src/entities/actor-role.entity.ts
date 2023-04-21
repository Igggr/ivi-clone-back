import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilm } from "./actor-film.entity";

@Entity()
export class ActorRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role_name: string;

    // на случай если нам понадобиться найти всех режисеров
    @OneToMany(() => ActorFilm, (personFilm) => personFilm.role)
    personsInFilm: ActorFilm[];
}