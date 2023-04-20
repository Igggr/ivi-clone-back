import { Column, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FilmEntity } from "./film.entity";
import { ActorEntity } from "./actor.entity";
import { ActorRoleEntity } from "./actor-role.entity";

export class ActorFilmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FilmEntity, (film) => film.personsInFilm)
    film: FilmEntity[]
        
    @Column()
    filmId: number;

    // можно сомещать несколько должностей в фильме
    @ManyToOne(() => ActorEntity, (person) => person.personInFilm)
    actor: ActorEntity;

    @Column()
    actorId: number;

    @ManyToOne(() => ActorRoleEntity, (actorRole) => actorRole.personsInFilm)
    role: ActorRoleEntity;

    @Column()
    roleId: number;

    // не просто художник, а по костюмам
    // не протсо актер, а играет дворецкого
    @Column()
    roleNotes: string;
}