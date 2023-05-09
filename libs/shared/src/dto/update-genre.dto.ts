import { PickType } from "@nestjs/swagger";
import { Genre } from "../entities";

export class UpdateGenreDto extends PickType(Genre, ['id', 'genreNameEn']) {}