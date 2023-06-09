import { Module } from '@nestjs/common';
import { SortingController } from './sorting.controller';
import { SortingService } from './sorting.service';

@Module({
  imports: [],
  controllers: [SortingController],
  providers: [SortingService],
})
export class SortingModule {}
