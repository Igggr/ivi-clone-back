import { NestFactory } from '@nestjs/core';
import { FilmModule } from './film.module';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { FILM } from '@app/rabbit/queues';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    FilmModule,
    // от кого получать сообщения
    RABBIT_OPTIONS(FILM),
  );
  app.listen();
}
bootstrap();
