import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AUTH, FILES_RECORD, FILM, GENRE, PROFILES } from '@app/rabbit/queues';
import { FilmController } from './controllers/film.controller';
import { AuthController } from './controllers/auth.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { GenreController } from './controllers/genre.controller';
import { SessionSerializer } from './utils/serializer';
import { JwtMiddleware } from './utils/jwt-middleware';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { GoogleStrategy } from './utils/google.strategy';

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
    ClientsModule.register([
      {
        name: FILES_RECORD,
        ...RABBIT_OPTIONS(FILES_RECORD),
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
