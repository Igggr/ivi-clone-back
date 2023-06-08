import { Module } from '@nestjs/common';
import { ParserSimulatorService } from './parser-simulator.service';
import { ClientsModule } from '@nestjs/microservices';
import { RABBIT_OPTIONS, FILM } from '@app/rabbit';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { FOR } from '@app/shared/constants/keys';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: FILM,
        useFactory: (configService: ConfigService) =>
          RABBIT_OPTIONS(FILM, configService.get<string>(FOR)),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [],
  providers: [ParserSimulatorService],
})
export class ParserSimulatorModule {}
