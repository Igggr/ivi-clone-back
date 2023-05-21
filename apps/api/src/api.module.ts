import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FilmController } from './controllers/film.controller';
import { JwtMiddleware } from './utils/jwt-middleware';
import { AUTH, FILES_RECORD, FILM, GENRE, PROFILES } from '@app/rabbit/queues';
import { ConfigModule } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { GenreController } from './controllers/genre.controller';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './utils/google.strategy';
import { SessionSerializer } from './utils/serializer';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api/.env',
      validationSchema: Joi.object({
        CLIENT_ID: Joi.string().required(),
        CLIENT_SECRET: Joi.string().required(),
      }),
    }),
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
