import { NestFactory } from '@nestjs/core';
import { ParserModule } from './parser.module';
import { PARSER } from '@app/rabbit/queues';
import { OPTIONS } from '@app/rabbit';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    ParserModule,
    OPTIONS(PARSER),
  );
  app.listen();
}
bootstrap();
