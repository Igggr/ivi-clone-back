import { Genre } from '../entities';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

export class CreateGenreDTO extends IntersectionType(
  PickType(Genre, ['genreName', 'url']),
  PartialType(PickType(Genre, ['genreNameEn'])),
) {}
