import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SharedModule } from '@app/shared/shared.module';
import { FilesService } from '@app/shared/files.service';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'static'),
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
  ],
  controllers: [AuthController, ProfilesController],
  providers: [FilesService],
})
export class ApiModule {}
