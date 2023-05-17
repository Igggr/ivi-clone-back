import { PickType } from '@nestjs/swagger';
import { Country } from '../entities';

export class CreateCountryDTO extends PickType(Country, [
  'countryName',
  'url',
]) {}
