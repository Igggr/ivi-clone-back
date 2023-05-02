import { Module } from '@nestjs/common';
import { ParserSimulatorService } from './parser-simulator.service';
import { ClientsModule } from '@nestjs/microservices';
import { OPTIONS, PARSER } from '@app/rabbit';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
    {
      name: PARSER,
      ...OPTIONS(PARSER),
    },
  ]),],
  controllers: [],
  providers: [ParserSimulatorService],
})
export class ParserSimulatorModule {}
