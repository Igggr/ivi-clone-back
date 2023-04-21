import { CreateActorDTO, ParsedActorDTO, RoleType } from '@app/shared';
import { Actor } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
  ) {}

  async ensureActorExist(dto: CreateActorDTO) {
    const actor = await this.actorRepository.findOne({
      where: { url: Equal(dto.url) },
    });
    if (actor) {
      return actor;
    }
    const newActor = await this.actorRepository.create(dto);
    return await this.actorRepository.save(newActor);
  }

  async bulkCreate(persons: Record<RoleType, ParsedActorDTO[]>) {
    const actorRoles = await Promise.all(
      Object.entries(persons).flatMap(([roleName, actors]) =>
        actors.map(async (dto) => ({
          actor: await this.ensureActorExist(dto),
          roleName,
          dto,
        })),
      ),
    );

    return actorRoles;
  }
}
