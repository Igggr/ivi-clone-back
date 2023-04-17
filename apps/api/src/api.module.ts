import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    ClientsModule.register([
      {
        name: 'AUTH',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'auth_queue',
          noAck: false,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [],
})
export class ApiModule {}
