import { Test, TestingModule } from '@nestjs/testing';
import { ActorParserService } from './actor.parser.service';

describe('ActorParserService', () => {
  let service: ActorParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActorParserService],
    }).compile();

    service = module.get<ActorParserService>(ActorParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
