import { Module } from '@nestjs/common';
import { ParserSimulatorService } from './parser-simulator.service';
import { ClientsModule } from '@nestjs/microservices';
import { RABBIT_OPTIONS, FILM } from '@app/rabbit';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: FILM,
        ...RABBIT_OPTIONS(FILM),
      },
    ]),
  ],
  controllers: [],
  providers: [ParserSimulatorService],
})
export class ParserSimulatorModule {}
