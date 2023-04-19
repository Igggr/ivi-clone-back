import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CountryEntity } from "./contry.entity";

export class FilmViewsCountry {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CountryEntity, (country) => country.filmViews)
    country: CountryEntity;

    @Column()
    countryId: number;

    @Column()
    premiere_date: Date;

    @Column({nullable: true})
    premiere_place?: string;

    @Column({nullable: false})
    viewersCount?: number;
}