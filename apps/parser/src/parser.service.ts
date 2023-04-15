import { Injectable } from '@nestjs/common';

@Injectable()
export class ParserService {
  parse() {
    console.log('парсим сайт');
  }
}
