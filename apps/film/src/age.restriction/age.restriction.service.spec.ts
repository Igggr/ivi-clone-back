import { Test, TestingModule } from '@nestjs/testing';
import { AgeRestrictionService } from './age.restriction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgeRestriction } from '@app/shared';

describe('AgeRestrictionService', () => {
  let service: AgeRestrictionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgeRestrictionService,
        {
          provide: getRepositoryToken(AgeRestriction),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AgeRestrictionService>(AgeRestrictionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
