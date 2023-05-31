import { Country } from '@app/shared/entities';
import { PickType } from '@nestjs/swagger';

export class ParsedCountryDTO extends PickType(Country, [
  'countryName',
  'url',
]) {}
