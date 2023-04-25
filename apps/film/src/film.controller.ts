import { Controller } from '@nestjs/common';
import { FilmService } from './film.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GET_FILMS, PARSED_DATA } from '@app/rabbit/events';
import { FilmQueryDTO, ParsedFilmDTO } from '@app/shared';

@Controller()
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @EventPattern({ cmd: PARSED_DATA })
  async saveParsedData(@Payload() data: ParsedFilmDTO) {
    console.log('Recieve parsed data');
    console.log(data);
    await this.filmService.createFromParsedData(data);
    console.log('Saved to DB');
  }

  @MessagePattern({ cmd: GET_FILMS })
  getFilms(@Payload() dto: FilmQueryDTO) {
    return this.filmService.find(dto);
  }
}
