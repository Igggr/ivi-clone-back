import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ParserService } from './parser.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly parserService: ParserService,
    ) {}

    @Cron('45 * * * * *')
    handleCron() {
        this.logger.debug('Called when the current second is 45');
        this.parserService.parse();
    }
}