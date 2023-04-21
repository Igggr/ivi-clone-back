import { Genre } from '../entities';
import { PickType } from '@nestjs/swagger';

export class CreateGenreDTO extends PickType(Genre, ['genre_name']) {}
