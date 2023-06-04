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
import { ParserSaverService } from './parser.saver/parser.saver.service';

@Controller()
export class FilmController {
  constructor(
    private readonly filmService: FilmService,
    private readonly parserSaverService: ParserSaverService,
  ) {}

  // вобще говоря emit здесь подходит больше, чем send
  // но тогда непонятно как протестировать, что данные создались
  @MessagePattern({ cmd: PARSED_DATA })
  async saveParsedData(@Payload() data: ParsedFilmDTO) {
    console.log('Recieve parsed data');

    return await this.parserSaverService.createFromParsedData(data);
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
