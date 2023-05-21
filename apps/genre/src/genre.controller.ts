import { Controller } from '@nestjs/common';
import { GenreService } from './genre.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  ENSURE_ALL_GENRES_EXISTS,
  GET_GENRES,
  GET_GENRES_BY_NAMES,
  GET_GENRE_BY_ID,
  ResponseDTO,
  UPDATE_GENRE,
  ack,
} from '@app/rabbit';
import { CreateGenreDTO, Genre, UpdateGenreDto } from '@app/shared';

@Controller()
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @MessagePattern({ cmd: UPDATE_GENRE })
  updateGenre(
    @Payload() dto: UpdateGenreDto,
    @Ctx() context: RmqContext,
  ): Promise<ResponseDTO<Genre>> {
    ack(context);
    return this.genreService.updateGenre(dto);
  }

  @MessagePattern({ cmd: GET_GENRES })
  getGenres(@Ctx() context: RmqContext): Promise<Genre[]> {
    ack(context);
    return this.genreService.getAll();
  }

  @MessagePattern({ cmd: GET_GENRES_BY_NAMES })
  getGenresByName(@Payload() genreNames: any, @Ctx() context: RmqContext) {
    ack(context);
    return this.genreService.getGenresByNames(genreNames);
  }

  @MessagePattern({ cmd: GET_GENRE_BY_ID })
  getGenreById(@Payload() id: number, @Ctx() context: RmqContext) {
    ack(context);
    return this.genreService.getById(id);
  }

  @MessagePattern({ cmd: ENSURE_ALL_GENRES_EXISTS })
  enusureAllGenresExists(
    @Payload() dto: CreateGenreDTO[],
    @Ctx() context: RmqContext,
  ): Promise<Genre[]> {
    ack(context);
    return this.genreService.ensureAllGenresExists(dto);
  }
}
