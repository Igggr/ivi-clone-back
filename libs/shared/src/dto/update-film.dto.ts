import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { CreateFilmDTO } from './create_film.dto';
import { Film } from '../entities';

export class UpdateFilmDTO extends IntersectionType(
  PartialType(CreateFilmDTO),
  PickType(Film, ['id']),
) {}
