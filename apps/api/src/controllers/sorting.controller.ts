import { SORTING } from '@app/rabbit';
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sorting')
@Controller('/sorting')
export class SortingController {
  constructor(@Inject(SORTING) private readonly client: ClientProxy) {}

  @Get('name')
  sortingByName() {
    return true;
  }
}
