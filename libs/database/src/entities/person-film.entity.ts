import { Column, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FilmEntity } from "./film.entity";
import { PersonEntity } from "./person.entity";
import { ActorRoleEntity } from "./actor-role.entity";

export class PersonFilmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FilmEntity, (film) => film.personsInFilm)
    film: FilmEntity[]
        
    @Column()
    filmId: number;

    // можно сомещать несколько должностей в фильме
    @ManyToOne(() => PersonEntity, (person) => person.personInFilm)
    person: PersonEntity;

    @Column()
    personId: number;

    @ManyToOne(() => ActorRoleEntity, (actorRole) => actorRole.personsInFilm)
    role: ActorRoleEntity;

    @Column()
    roleId: number;

    // не просто художник, а по костюмам
    // не протсо актер, а играет дворецкого
    @Column()
    roleNotes: string;
}