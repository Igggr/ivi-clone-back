import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule } from '@nestjs/microservices';
import { PARSER } from '@app/rabbit/queues';
import { OPTIONS } from '@app/rabbit';
import { ActorService } from './actor/actor.service';
import { Film } from '@app/shared/entities/film.entity';
import {
  Actor,
  ActorFilm,
  ActorRole,
  Country,
  FilmViewsCountry,
  Genre,
  Review,
  Comment,
} from '@app/shared/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryService } from './country/country.service';
import { ActorRoleService } from './actor.role/actor.role.service';
import { ReviewService } from './review/review.service';
import { GenreService } from './genre/genre.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PARSER,
        ...OPTIONS(PARSER),
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/film/.env',
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRoot([
      Film,
      Actor,
      ActorFilm,
      ActorRole,
      Review,
      Comment,
      Country,
      FilmViewsCountry,
      Genre,
    ]),
    TypeOrmModule.forFeature([
      Film,
      Actor,
      ActorFilm,
      ActorRole,
      Review,
      Comment,
      Country,
      FilmViewsCountry,
      Genre,
    ]),
  ],
  controllers: [FilmController],
  providers: [
    FilmService,
    ActorService,
    CountryService,
    ActorRoleService,
    ReviewService,
    GenreService,
    AgeRestrictionService,
  ],
})
export class FilmModule {}
