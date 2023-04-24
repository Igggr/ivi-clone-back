import { PartialType, PickType, IntersectionType } from '@nestjs/swagger';
import { ParsedActorDTO } from './parsed-actor.dto';
import { Film } from '@app/shared/entities/film.entity';
import { RoleType } from './roles';
import { CreateCountryDTO } from '../create-country.dto';
import { CreateGenreDTO } from '../create-genre.dto';
import { CreateAgeRestrictionDTO } from '../create-age-restriction.dto';

export class ParsedFilmDTO extends PickType(Film, [
  'url',
  'year',
  'title',
  'originalTitle',
  'slogan',
  'duration',
  'preview',
]) {
  genres: CreateGenreDTO[];
  country: CreateCountryDTO;
  persons: Record<RoleType, ParsedActorDTO[]>;
  ageRestriction: CreateAgeRestrictionDTO;
}
