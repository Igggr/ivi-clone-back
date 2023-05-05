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

  private async ensureActorExist(dto: CreateActorDTO) {
    const actor = await this.actorRepository.findOne({
      where: { url: Equal(dto.url) },
    });
    if (actor) {
      return actor;
    }
    const newActor = await this.actorRepository.create(dto);
    return await this.actorRepository.save(newActor);
  }

  private async ensureAllActorsExists(
    persons: Record<RoleType, ParsedActorDTO[]>,
  ) {
    const savedActors = new Map<string, Actor>();

    // да. именно одн за другим - иначе один актер может одновременно начать сохраняться 2 раза
    // например как продюсер и режисер - нарушт ограничение уникальностт url на его страницу на кинопоиске
    for (const dto of Object.values(persons).flat()) {
      if (!savedActors.has(dto.url)) {
        const actor = await this.ensureActorExist(dto);
        savedActors.set(dto.url, actor);
      }
    }
    return savedActors;
  }

  async bulkCreate(
    filmId: number,
    persons: Record<RoleType, ParsedActorDTO[]>,
  ) {
    if (!persons) {
      return;
    }
    const roles = await this.actorRoleService.ensureAllRolesExist(
      Object.keys(persons),
    );

    const savedActors = await this.ensureAllActorsExists(persons);

    const actorRoles = await Promise.all(
      Object.entries(persons).flatMap(([roleName, actors]) =>
        actors.map(async (dto) => ({
          actor: savedActors.get(dto.url),
          role: roles.get(roleName),
          dto,
        })),
      ),
    );

    const actorRolesInput = actorRoles.map(({ actor, role, dto }) => ({
      actorId: actor.id,
      filmId,
      roleId: role.id,
      roleNotes: dto.role,
    }));

    const actorsInFilm = this.actorFilmRepository.create(actorRolesInput);
    // console.log(actorsInFilm);
    await this.actorFilmRepository.save(actorsInFilm);

    return actorRoles;
  }
}
