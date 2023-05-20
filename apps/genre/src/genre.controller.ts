import { Controller } from '@nestjs/common';
import { GenreService } from './genre.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  CREATE_GENRE,
  DELETE_GENRE,
  ENSURE_ALL_GENRES_EXISTS,
  GET_GENRES,
  GET_GENRE_BY_ID,
  ResponseDTO,
  UPDATE_GENRE,
  ack,
} from '@app/rabbit';
import {
  ParsedGenreDTO,
  Genre,
  UpdateGenreDto,
  CreateGenreDTO,
} from '@app/shared';
import { DeleteResult } from 'typeorm';

@Controller()
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @MessagePattern({ cmd: CREATE_GENRE })
  createGenre(
    @Payload() dto: CreateGenreDTO,
    @Ctx() context: RmqContext,
  ): Promise<ResponseDTO<Genre>> {
    ack(context);
    return this.genreService.create(dto);
  }

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

  @MessagePattern({ cmd: GET_GENRE_BY_ID })
  getGenreById(@Payload() id: number, @Ctx() context: RmqContext) {
    ack(context);
    return this.genreService.getById(id);
  }

  @MessagePattern({ cmd: ENSURE_ALL_GENRES_EXISTS })
  enusureAllGenresExists(
    @Payload() dto: ParsedGenreDTO[],
    @Ctx() context: RmqContext,
  ): Promise<Genre[]> {
    ack(context);
    return this.genreService.ensureAllGenresExists(dto);
  }

  @MessagePattern({ cmd: DELETE_GENRE })
  deleteGenre(
    @Payload() id: number,
    @Ctx() context: RmqContext,
  ): Promise<DeleteResult> {
    ack(context);
    return this.genreService.delete(id);
  }
}
