import { NestFactory } from '@nestjs/core';
import { ParserSimulatorModule } from './parser-simulator.module';
import { RmqOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    ParserSimulatorModule,
  );
  app.listen();
}
bootstrap();
