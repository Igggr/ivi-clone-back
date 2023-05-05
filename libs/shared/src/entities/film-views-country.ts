import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Country } from './contry.entity';

@Entity()
export class FilmViewsCountry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Country, (country) => country.filmViews)
  country: Country;

  @Column()
  countryId: number;

  @Column()
  premiere_date: Date;

  @Column({ nullable: true })
  premiere_place?: string;

  @Column({ nullable: false })
  viewersCount?: number;
}
