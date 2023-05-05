import { Test, TestingModule } from '@nestjs/testing';
import { ActorService } from './actor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Actor, ActorFilm, ActorRole } from '@app/shared/entities';
import { ActorRoleService } from '../actor.role/actor.role.service';

describe('ActorService', () => {
  let service: ActorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorService,
        ActorRoleService,
        {
          provide: getRepositoryToken(Actor),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ActorFilm),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ActorRole),
          useValue: {},
        },
        {
          provide: 'ActorRoleService',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ActorService>(ActorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
