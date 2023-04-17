import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';
import { ClientsModule } from '@nestjs/microservices';
import { OPTIONS } from '@app/rabbit';
import { PARSER } from '@app/rabbit/queues';
import { DummyController } from './dummy.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: PARSER,
        ...OPTIONS(PARSER),
      }
    ]),
  ],
  controllers: [DummyController],
  providers: [ParserService, TasksService],
})
export class ParserModule {}

