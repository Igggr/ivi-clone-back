import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ActorFilmEntity } from "./actor-film.entity";

@Entity()
export class ActorRoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role_name: string;

    // на случай если нам понадобиться найти всех режисеров
    @OneToMany(() => ActorFilmEntity, (personFilm) => personFilm.role)
    personsInFilm: ActorFilmEntity[];
}