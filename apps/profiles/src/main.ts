import { NestFactory } from '@nestjs/core';
import { ProfilesModule } from './profiles.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { PROFILES, RABBIT_OPTIONS } from '@app/rabbit';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProfilesModule,
    RABBIT_OPTIONS(PROFILES),
  );
  await app.listen();
}
bootstrap();
