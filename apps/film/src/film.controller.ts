import { Controller } from '@nestjs/common';
import { FilmService } from './film.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { GET_FILMS, PARSED_DATA } from '@app/rabbit/events';
import { FilmQueryDTO, ParsedFilmDTO } from '@app/shared';
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
}
