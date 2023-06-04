import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
import { ParserService } from './parser.service';
import { ClientProxy } from '@nestjs/microservices';
import { FILM } from '@app/rabbit/queues';
import { PARSED_DATA } from '@app/rabbit/events';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly parserService: ParserService,
    @Inject(FILM)
    private readonly client: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Cron('30 * * * * *')
  async handleCron() {
    this.logger.debug('Called every 30 seconds');

    // до номера 299 страницы просто отсутствуют
    const film: number = (await this.cacheManager.get('film')) ?? 299;

    // если упадет - фильм наверно косячный, с остутсвующими данными.
    // Проcто перейдем к следующему
    await this.cacheManager.set('film', film + 1);

    const res = await this.parserService.parse(film);

    if (res.status === 'ok') {
      this.logger.log(`Film ${film} parsed succesefully`);
      this.client.send({ cmd: PARSED_DATA }, res.value);
    } else {
      console.log(`Unable to parse film ${film}`);
      console.log(res.error);
    }
  }
}
