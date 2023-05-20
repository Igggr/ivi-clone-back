import { Genre } from '../../entities';
import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

export class ParsedGenreDTO extends IntersectionType(
  PickType(Genre, ['genreName', 'url']),
  PartialType(PickType(Genre, ['genreNameEn'])),
) {}
