import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { DatabaseModule, db_schema } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH, GENRE, PARSER } from '@app/rabbit/queues';
import { RABIT_OPTIONS } from '@app/rabbit';
import { ActorService } from './actor/actor.service';
import {
  Film,
  Actor,
  ActorFilm,
  ActorRole,
  Country,
  FilmViewsCountry,
  Genre,
  Review,
  Comment,
  AgeRestriction,
} from '@app/shared';
import { CountryService } from './country/country.service';
import { ActorRoleService } from './actor.role/actor.role.service';
import { ReviewService } from './review/review.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';
import { FilmGenre } from '@app/shared/entities/film-genre.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PARSER,
        ...RABIT_OPTIONS(PARSER),
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
        name: GENRE,
        ...RABIT_OPTIONS(GENRE),
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
  ],
})
export class FilmModule {}
