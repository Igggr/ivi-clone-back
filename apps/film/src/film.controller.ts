import { Controller } from '@nestjs/common';
import { FilmService } from './film.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  CREATE_FILM,
  DELETE_FILM,
  GET_FILMS,
  PARSED_DATA,
  UPDATE_FILM,
} from '@app/rabbit/events';
import {
  FilmQueryDTO,
  ParsedFilmDTO,
  CreateFilmDTO,
  UpdateFilmDTO,
} from '@app/shared';
import { ack } from '@app/rabbit';

@Controller()
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @EventPattern({ cmd: PARSED_DATA })
  async saveParsedData(@Payload() data: ParsedFilmDTO) {
    console.log('Recieve parsed data');

    await this.filmService.createFromParsedData(data);
    console.log('Saved to DB');
  }

  @MessagePattern({ cmd: GET_FILMS })
  async getFilms(@Payload() dto: FilmQueryDTO, @Ctx() context: RmqContext) {
    ack(context);
    return (await this.filmService.find(dto)) ?? [];
  }

  @MessagePattern({ cmd: DELETE_FILM })
  deleteFilm(@Payload() id: number, @Ctx() context: RmqContext) {
    ack(context);

    return this.filmService.delete(id);
  }

  @MessagePattern({ cmd: CREATE_FILM })
  create(@Payload() dto: CreateFilmDTO, @Ctx() context: RmqContext) {
    ack(context);

    return this.filmService.create(dto);
  }

  @MessagePattern({ cmd: UPDATE_FILM })
  update(@Payload() dto: UpdateFilmDTO, @Ctx() context: RmqContext) {
    ack(context);

    return this.filmService.update(dto);
  }
}
