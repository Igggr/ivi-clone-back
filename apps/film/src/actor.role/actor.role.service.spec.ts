import { Test, TestingModule } from '@nestjs/testing';
import { ActorRoleService } from './actor.role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActorRole } from '@app/shared/entities';

describe('ActorRoleService', () => {
  let service: ActorRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorRoleService,
        {
          provide: getRepositoryToken(ActorRole),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ActorRoleService>(ActorRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
