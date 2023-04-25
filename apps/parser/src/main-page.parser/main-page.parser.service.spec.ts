import { Test, TestingModule } from '@nestjs/testing';
import { MainPageParserService } from './main-page.parser.service';

describe('MainpageParserService', () => {
  let service: MainPageParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainPageParserService],
    }).compile();

    service = module.get<MainPageParserService>(MainPageParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
