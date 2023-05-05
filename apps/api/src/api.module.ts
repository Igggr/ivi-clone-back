import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { SharedModule } from '@app/shared/shared.module';
import { FilesService } from 'apps/files-record/src/files.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtMiddleware } from './jwt-middleware';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: path.join(__dirname, '..', 'static'),
    // }),
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
    JwtModule.register({
      secret: process.env.PRIVATE_KEY ?? 'SECRET',
      signOptions: {
        expiresIn: '24h',
      },
    }),
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
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(ProfilesController, AuthController);
  }
}
