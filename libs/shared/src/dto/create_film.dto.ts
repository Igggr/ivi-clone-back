import { ApiProperty, PickType } from '@nestjs/swagger';
import { Film } from '../entities';

export class CreateFilmDTO extends PickType(Film, [
  'title',
  'originalTitle',
  'slogan',
  'year',
  'duration',
]) {
  @ApiProperty({ description: 'Назавние страны', example: 'USA' })
  countryName: string;
}
