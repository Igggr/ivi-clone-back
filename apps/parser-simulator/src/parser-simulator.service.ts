import { Inject, Injectable } from '@nestjs/common';
import { PARSED_DATA, FILM } from '@app/rabbit';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { data } from './data';

@Injectable()
export class ParserSimulatorService {
  constructor(
    @Inject(FILM)
    private readonly client: ClientProxy,
  ) {}

  @Cron('5 * * * * *')
  async handleCron() {
    console.log('sending data...');
    this.client.send({ cmd: PARSED_DATA }, data);
  }
}
