import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AUTH, RABBIT_OPTIONS } from '@app/rabbit';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    RABBIT_OPTIONS(AUTH, process.env.FOR),
  );

  await app.listen();
}
bootstrap();
