import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from './country.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from '@app/shared/entities';

describe('CountryService', () => {
  let service: CountryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: getRepositoryToken(Country),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
