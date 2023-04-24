import { Test, TestingModule } from '@nestjs/testing';
import { AgeRestrictionService } from './age.restriction.service';

describe('AgeRestrictionService', () => {
  let service: AgeRestrictionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgeRestrictionService],
    }).compile();

    service = module.get<AgeRestrictionService>(AgeRestrictionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
