import { CreateActorDTO, ParsedActorDTO, RoleType } from '@app/shared';
import { Actor, ActorFilm } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { ActorRoleService } from '../actor.role/actor.role.service';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(ActorFilm)
    private readonly actorFilmRepository: Repository<ActorFilm>,
    private readonly actorRoleService: ActorRoleService,
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

  async bulkCreate(
    filmId: number,
    persons: Record<RoleType, ParsedActorDTO[]>,
  ) {
    const roles = await this.actorRoleService.ensureAllRolesExist(
      Object.keys(persons),
    );

    const actorRoles = await Promise.all(
      Object.entries(persons).flatMap(([roleName, actors]) =>
        actors.map(async (dto) => ({
          actor: await this.ensureActorExist(dto),
          role: roles.get(roleName),
          dto,
        })),
      ),
    );

    const actorsInFilm = this.actorFilmRepository.create(
      actorRoles.map(({ actor, role, dto }) => ({
        actorId: actor.id,
        filmId,
        roleId: role.id,
        roleNotes: dto.role,
      })),
    );
    console.log(actorsInFilm);
    this.actorFilmRepository.save(actorsInFilm);

    return actorRoles;
  }
}
