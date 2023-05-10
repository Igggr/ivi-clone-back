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

@Controller()
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @EventPattern({ cmd: PARSED_DATA })
  async saveParsedData(
    @Payload() data: ParsedFilmDTO,
    @Ctx() context: RmqContext,
  ) {
    console.log('Recieve parsed data');

    // const channel = context.getChannelRef();
    // const message = context.getMessage();
    // channel.ack(message);

    await this.filmService.createFromParsedData(data);
    console.log('Saved to DB');
  }

  @MessagePattern({ cmd: GET_FILMS })
  getFilms(@Payload() dto: FilmQueryDTO, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return this.filmService.find(dto);
  }
}
