import { GenreEntity } from "../entities";
import { PickType } from '@nestjs/swagger';

export class CreateGenreDTO extends PickType(GenreEntity, ['genre_name']) {}
