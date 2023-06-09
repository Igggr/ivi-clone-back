import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FilmController } from './controllers/film.controller';
import { JwtMiddleware } from './utils/jwt-middleware';
import {
  AUTH,
  FILES_RECORD,
  FILM,
  GENRE,
  PROFILES,
  SORTING,
} from '@app/rabbit/queues';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfilesController } from './controllers/profile.controller';
import { PassportModule } from '@nestjs/passport';
import { GenreController } from './controllers/genre.controller';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { ClientsModule } from '@nestjs/microservices';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from './utils/google.strategy';
import { SessionSerializer } from './utils/serializer';
import * as Joi from 'joi';
import { ServeStaticModule } from '@nestjs/serve-static';
import { staticDir } from '@app/shared';
import { FOR } from '@app/shared/constants/keys';

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
    ClientsModule.registerAsync([
      {
        name: FILM,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(FILM, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
      {
        name: AUTH,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(AUTH, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
      {
        name: PROFILES,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(PROFILES, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
      {
        name: GENRE,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(GENRE, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
      {
        name: FILES_RECORD,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(FILES_RECORD, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
      {
        name: SORTING,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(SORTING, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
    ]),
    PassportModule.register({ session: true }),
    ServeStaticModule.forRoot({
      serveRoot: '/photo',
      rootPath: staticDir(),
    }),
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
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        ProfilesController,
        AuthController,
        GenreController,
        FilmController,
      );
  }
}
