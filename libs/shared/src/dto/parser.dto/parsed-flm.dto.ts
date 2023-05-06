import { PickType } from '@nestjs/swagger';
import { ParsedActorDTO } from './parsed-actor.dto';
import { Film } from '../../entities';
import { RoleType } from './roles';
import { CreateCountryDTO } from '../create-country.dto';
import { CreateGenreDTO } from '../create-genre.dto';
import { CreateAgeRestrictionDTO } from '../create-age-restriction.dto';
import { ParsedReviewDTO } from './parsed-review.dto';

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
  reviews: ParsedReviewDTO[];
}
