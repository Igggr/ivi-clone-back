import { NestFactory } from '@nestjs/core';
import { ProfilesModule } from './profiles.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProfilesModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'profiles_queue',
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
