import { Controller, Get } from '@nestjs/common';
import { FilmService } from './film.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GET_FILMS, PARSE_DATA } from '@app/rabbit/events';
import { FilmQueryDTO, PaginationDTO } from '@app/database/dto';

@Controller()
export class FilmController {
  constructor(private readonly filmService: FilmService) {}


  @EventPattern(PARSE_DATA)
  saveParsedData(@Payload() data) {
    console.log('Recieve parsed data');
    console.log(data);
  }


  @MessagePattern({ cmd: GET_FILMS })
  getFilms(@Payload() dto: FilmQueryDTO) {
    return this.filmService.find(dto);
  }
}
