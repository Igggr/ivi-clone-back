import { Controller, Get } from '@nestjs/common';
import { SortingService } from './sorting.service';

@Controller()
export class SortingController {
  constructor(private readonly sortingService: SortingService) {}

  @Get()
  getHello(): string {
    return this.sortingService.getHello();
  }
}
