import { PickType } from '@nestjs/swagger';
import { ParsedActorDTO } from './parsed-actor.dto';
import { Film } from '../../entities';
import { RoleType } from './roles';
import { CreateCountryDTO } from '../create-country.dto';
import { ParsedGenreDTO } from './parsed-genre.dto';
import { CreateAgeRestrictionDTO } from '../create-age-restriction.dto';
import { ParsedReviewDTO } from './parsed-review.dto';
import { ParsedViewDTO } from './parsed-views.dto';

export class ParsedFilmDTO extends PickType(Film, [
  'url',
  'year',
  'title',
  'originalTitle',
  'slogan',
  'duration',
  'preview',
]) {
  genres: ParsedGenreDTO[];
  country: CreateCountryDTO;
  persons: Record<RoleType, ParsedActorDTO[]>;
  ageRestriction: CreateAgeRestrictionDTO;
  reviews: ParsedReviewDTO[];
  views: ParsedViewDTO[];
}
