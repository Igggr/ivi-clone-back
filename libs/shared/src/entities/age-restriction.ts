import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Film } from './film.entity';

@Entity()
export class AgeRestriction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string;

  @Column()
  abbreviation: string;

  // возможно надо перенести в film или в отдельную таблицу -  кажется, что есть 2 разных рейтинга (м.б. русский и американский?)
  // но пока не станет ясно, что перенносить точно надо - пусть будет здесь. По смыслуэто все же ограничение
  @Column()
  minAge: string;

  @Column()
  description: string;

  // @Column()
  // fullDescription: string;

  @OneToMany(() => Film, (film) => film.ageRestriction)
  films: Film[];
}
