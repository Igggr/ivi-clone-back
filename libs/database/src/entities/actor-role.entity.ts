import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PersonFilmEntity } from "./person-film.entity";

@Entity()
export class ActorRoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role_name: string;

    // на случай если нам понадобиться найти всех режисеров
    @OneToMany(() => PersonFilmEntity, (personFilm) => personFilm.role)
    personsInFilm: PersonFilmEntity[];
}