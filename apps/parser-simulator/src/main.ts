import { NestFactory } from '@nestjs/core';
import { ParserSimulatorModule } from './parser-simulator.module';
import { RmqOptions } from '@nestjs/microservices';
import { RABIT_OPTIONS, PARSER } from '@app/rabbit';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RmqOptions>(
    ParserSimulatorModule,
    RABIT_OPTIONS(PARSER),
  );
  app.listen();
}
bootstrap();