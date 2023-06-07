import { ApiProperty, PickType } from '@nestjs/swagger';
import { Film } from '../entities';

export class CreateFilmDTO extends PickType(Film, [
  'title',
  'originalTitle',
  'slogan',
  'year',
  'duration',
]) {
  @ApiProperty({ description: 'Назвaние страны', example: 'USA' })
  countryName: string;

  @ApiProperty({
    description: 'Назвaние жанров',
    example: ['фантастика', 'боевик', 'триллер'],
  })
  genreNames?: string[];
}
