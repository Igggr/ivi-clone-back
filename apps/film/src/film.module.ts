import { Module } from '@nestjs/common';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule } from '@nestjs/microservices';
import { PARSER } from '@app/rabbit/queues';
import { OPTIONS } from '@app/rabbit';

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
    DatabaseModule.forRoot([]),
  ],
  controllers: [FilmController],
  providers: [FilmService],
})
export class FilmModule {}
