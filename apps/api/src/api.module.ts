import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { FILM } from '@app/rabbit/queues';
import { RABIT_OPTIONS } from '@app/rabbit';
import { FilmController } from './controllers/film.controller';
import { JwtMiddleware } from './jwt-middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: FILM,
        ...RABIT_OPTIONS(FILM),
      },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH',
        ...RABIT_OPTIONS('auth'),
      },
    ]),
    ClientsModule.register([
      {
        name: 'PROFILES',
        ...RABIT_OPTIONS('profiles'),
      },
    ]),
  ],
  controllers: [AuthController, ProfilesController, FilmController],
  providers: [],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(ProfilesController, AuthController);
  }
}
