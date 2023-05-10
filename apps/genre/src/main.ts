import { NestFactory } from '@nestjs/core';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { GENRE } from '@app/rabbit/queues';
import { RmqOptions } from '@nestjs/microservices';
import { GenreModule } from './genre.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    GenreModule,
    RABBIT_OPTIONS(GENRE),
  );
  app.listen();
}
bootstrap();
