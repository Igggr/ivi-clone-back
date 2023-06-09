import { Test, TestingModule } from '@nestjs/testing';
import { SortingController } from './sorting.controller';
import { SortingService } from './sorting.service';

describe('SortingController', () => {
  let sortingController: SortingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SortingController],
      providers: [SortingService],
    }).compile();

    sortingController = app.get<SortingController>(SortingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sortingController.getHello()).toBe('Hello World!');
    });
  });
});
