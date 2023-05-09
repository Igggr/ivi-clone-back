import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Film } from "./film.entity";

@Entity()
export class FilmGenre {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    genreId: number; // Genre в другом микросервисе => связи нет

    @ManyToOne(() => Film, (film) => film.filmGenres) 
    film: Film;
    
    @Column()
    filmId: number;
} 