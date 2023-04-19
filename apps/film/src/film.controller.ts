import { Controller, Get } from '@nestjs/common';
import { FilmService } from './film.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PARSE_DATA } from '@app/rabbit/events';

@Controller()
export class FilmController {
  constructor(private readonly filmService: FilmService) {}


  @MessagePattern(PARSE_DATA)
  saveParsedData(@Payload() data) {
    console.log('Recieve parsed data');
  }
}
