import { Injectable } from '@nestjs/common';

@Injectable()
export class SortingService {
  getHello(): string {
    return 'Hello World!';
  }
}
