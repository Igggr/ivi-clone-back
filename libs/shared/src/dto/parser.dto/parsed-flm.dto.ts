import { PickType } from '@nestjs/swagger';
import { ParsedActorDTO } from './parsed-actor.dto';
import { Film } from '@app/shared/entities/film.entity';
import { RoleType } from './roles';
import { CreateCountryDTO } from '../create-country.dto';

// TODO: есть похожая в parser / xpathю Оставить только одну

export class ParsedFilmDTO extends PickType(Film, [
  'url',
  'year',
  'title',
  'originalTitle',
  'slogan',
]) {
  genres: string[];
  country: CreateCountryDTO;
  persons: Record<RoleType, ParsedActorDTO[]>;
}
