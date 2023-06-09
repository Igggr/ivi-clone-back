import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { DatabaseModule, db_schema } from '@app/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { GENRE, PROFILES } from '@app/rabbit/queues';
import { RABBIT_OPTIONS } from '@app/rabbit';
import { ActorService } from './actor/actor.service';
import {
  Film,
  Actor,
  ActorFilm,
  ActorRole,
  Country,
  FilmViewsCountry,
  Review,
  Comment,
  AgeRestriction,
} from '@app/shared';
import { CountryService } from './country/country.service';
import { ActorRoleService } from './actor.role/actor.role.service';
import { ReviewService } from './review/review.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';
import { FilmGenre } from '@app/shared/entities/film-genre.entity';
import { ParserSaverService } from './parser.saver/parser.saver.service';
import { CommentService } from './comment/comment.service';
import { FOR } from '@app/shared/constants/keys';

@Module({
  imports: [
    // кому отправлять собщения
    ClientsModule.registerAsync([
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
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/film/.env',
      validationSchema: db_schema,
    }),
    ...DatabaseModule.forRoot([
      Film,
      Actor,
      ActorFilm,
      ActorRole,
      Review,
      Comment,
      Country,
      FilmViewsCountry,
      AgeRestriction,
      FilmGenre,
    ]),
  ],
  controllers: [FilmController],
  providers: [
    FilmService,
    ActorService,
    CountryService,
    ActorRoleService,
    ReviewService,
    AgeRestrictionService,
    ParserSaverService,
    CommentService,
  ],
})
export class FilmModule {}
