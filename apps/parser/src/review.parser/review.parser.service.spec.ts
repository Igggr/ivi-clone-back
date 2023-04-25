import { Test, TestingModule } from '@nestjs/testing';
import { ReviewParserService } from './review.parser.service';

describe('ReviewParserService', () => {
  let service: ReviewParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewParserService],
    }).compile();

    service = module.get<ReviewParserService>(ReviewParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
