import { PickType } from '@nestjs/swagger';
import { ParsedCountryDTO } from './parsed-country.dto';
import { FilmViewsCountry } from '@app/shared/entities';

export class ParsedViewDTO extends PickType(FilmViewsCountry, [
  'premiere_place',
]) {
  date: string;
  country: ParsedCountryDTO;
  views: string;
}
