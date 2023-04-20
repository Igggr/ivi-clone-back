import { PickType } from '@nestjs/swagger';
import { ParsedActorDTO } from "./parsed-actor.dto";
import { FilmEntity } from '@app/shared/entities/film.entity';
import { RoleType } from './roles';

// TODO: есть похожая в parser / xpathю Оставить только одну

export class ParsedFilmDTO extends PickType(
    FilmEntity,
    ['url', 'year', 'title', 'originalTitle', 'slogan']
) {
    genres: string[];
    country: string;
    persons: Record<RoleType, ParsedActorDTO[]>;
}