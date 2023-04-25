import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule } from '@nestjs/microservices';

// import * as redisStore from 'cache-manager-redis-store'; // оканчивается ошибкой
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redisStore = require('cache-manager-redis-store').redisStore;

import { OPTIONS } from '@app/rabbit';
import { PARSER } from '@app/rabbit/queues';
import { ParserService } from './parser.service';
import { TasksService } from './task.service';
import { ActorParserService } from './actor.parser/actor.parser.service';
import { ReviewParserService } from './review.parser/review.parser.service';
import { MainPageParserService } from './main-page.parser/main-page.parser.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: PARSER,
        ...OPTIONS(PARSER),
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
