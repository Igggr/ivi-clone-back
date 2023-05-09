import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RABIT_OPTIONS } from '@app/rabbit';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      ...RABIT_OPTIONS('auth'),
    },
  );
  await app.listen();
}
bootstrap();
