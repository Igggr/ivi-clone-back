import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './utils/google.strategy';
import { SessionSerializer } from './utils/serializer';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
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
    ClientsModule.register([
      {
        name: 'PROFILES',
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
    ]),
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController, ProfilesController],
  providers: [GoogleStrategy, SessionSerializer],
})
export class ApiModule {}
