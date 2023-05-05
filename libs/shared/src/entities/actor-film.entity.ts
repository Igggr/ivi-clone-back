import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';
import { Actor } from './actor.entity';
import { ActorRole } from './actor-role.entity';

@Entity()
export class ActorFilm {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Film, (film) => film.personsInFilm)
  film: Film;

  @Column()
  filmId: number;

  // можно сомещать несколько должностей в фильме
  @ManyToOne(() => Actor, (person) => person.personInFilm)
  actor: Actor;

  @Column()
  actorId: number;

  @ManyToOne(() => ActorRole, (actorRole) => actorRole.personsInFilm)
  role: ActorRole;

  @Column()
  roleId: number;

  // не просто художник, а по костюмам
  // не протсо актер, а играет дворецкого
  @Column()
  roleNotes: string;
}
