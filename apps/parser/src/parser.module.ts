import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '@nestjs/microservices';

// import * as redisStore from 'cache-manager-redis-store'; // оканчивается ошибкой
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redisStore = require('cache-manager-redis-store').redisStore;

import { RABBIT_OPTIONS } from '@app/rabbit';
import { FILM } from '@app/rabbit/queues';
import { ParserService } from './parser.service';
import { TasksService } from './task.service';
import { ActorParserService } from './actor.parser/actor.parser.service';
import { ReviewParserService } from './review.parser/review.parser.service';
import { MainPageParserService } from './main-page.parser/main-page.parser.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FOR } from '@app/shared/constants/keys';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: FILM,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(FILM, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
    ]),
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 5003,
    }),
  ],
  controllers: [],
  providers: [
    ParserService,
    TasksService,
    ActorParserService,
    ReviewParserService,
    MainPageParserService,
  ],
})
export class ParserModule {}
