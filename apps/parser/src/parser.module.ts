import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [ParserService, TasksService],
})
export class ParserModule {}
