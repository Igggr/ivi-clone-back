import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH, FILM, GENRE, PROFILES } from '@app/rabbit/queues';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { FilmController } from './controllers/film.controller';
import { AuthController } from './controllers/auth.controller';
import { ProfilesController } from './controllers/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { GenreController } from './controllers/genre.controller';
import { GoogleStrategy } from './utils/google.strategy';
import { SessionSerializer } from './utils/serializer';
import { JwtMiddleware } from './utils/jwt-middleware';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FILM,
        ...RABBIT_OPTIONS(FILM),
      },
    ]),
    ClientsModule.register([
      {
        name: AUTH,
        ...RABBIT_OPTIONS(AUTH),
      },
    ]),
    ClientsModule.register([
      {
        name: PROFILES,
        ...RABBIT_OPTIONS(PROFILES),
      },
    ]),
    ClientsModule.register([
      {
        name: GENRE,
        ...RABBIT_OPTIONS(GENRE),
      },
    ]),
    PassportModule.register({ session: true }),
  ],
  controllers: [
    AuthController,
    ProfilesController,
    FilmController,
    GenreController,
  ],
  providers: [GoogleStrategy, SessionSerializer],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(ProfilesController, AuthController);
  }
}
