import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ProfilesController } from './controllers/profile.controller';
import { AUTH, FILM, GENRE, PROFILES } from '@app/rabbit/queues';
import { RABIT_OPTIONS } from '@app/rabbit';
import { FilmController } from './controllers/film.controller';
import { JwtMiddleware } from './jwt-middleware';
import { GenreController } from './controllers/genre.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FILM,
        ...RABIT_OPTIONS(FILM),
      },
    ]),
    ClientsModule.register([
      {
        name: AUTH,
        ...RABIT_OPTIONS(AUTH),
      },
    ]),
    ClientsModule.register([
      {
        name: PROFILES,
        ...RABIT_OPTIONS(PROFILES),
      },
    ]),
    ClientsModule.register([
      {
        name: GENRE,
        ...RABIT_OPTIONS(GENRE),
      },
    ]),
  ],
  controllers: [
    AuthController,
    ProfilesController,
    FilmController,
    GenreController,
  ],
  providers: [],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(ProfilesController, AuthController);
  }
}
