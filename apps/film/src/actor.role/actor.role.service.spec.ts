import { Test, TestingModule } from '@nestjs/testing';
import { ActorRoleService } from './actor.role.service';

describe('ActorRoleService', () => {
  let service: ActorRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActorRoleService],
    }).compile();

    service = module.get<ActorRoleService>(ActorRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
