import { NestFactory } from '@nestjs/core';
import { FilmModule } from './film.module';
import { OPTIONS } from '@app/rabbit';
import { PARSER } from '@app/rabbit/queues';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    FilmModule,
    OPTIONS(PARSER),
  );
  app.listen();
}
bootstrap();
