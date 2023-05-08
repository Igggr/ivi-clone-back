import { NestFactory } from '@nestjs/core';
import { FilmModule } from './film.module';
import { RABIT_OPTIONS } from '@app/rabbit';
import { PARSER } from '@app/rabbit/queues';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    FilmModule,
    RABIT_OPTIONS(PARSER),
  );
  app.listen();
}
bootstrap();
