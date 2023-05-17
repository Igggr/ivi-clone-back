import { NestFactory } from '@nestjs/core';
import { ParserModule } from './parser.module';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(ParserModule);
  app.listen();
}
bootstrap();
