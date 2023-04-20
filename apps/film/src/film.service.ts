
import { FilmQueryDTO, ParsedFilmDTO } from '@app/shared';
import { ActorEntity, ActorFilmEntity, ActorRoleEntity } from '@app/shared/entities';
import { FilmEntity } from '@app/shared/entities/film.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { ActorService } from './actor/actor.service';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly filmRepository: Repository<FilmEntity>,
    @InjectRepository(FilmEntity)
    private readonly actorFilmRepository: Repository<ActorFilmEntity>,
    private readonly actorService: ActorService,
  ) { }
  
  async createFromParsedData(dto: ParsedFilmDTO) {
    console.log('Creeating films from parsed data');
    const actorRoles = await this.actorService.bulkCreate(dto.persons);

    const film = this.filmRepository.create({
      title: dto.title,
      originalTitle: dto.originalTitle,
      year: dto.year,
      slogan: dto.slogan,
    });

    await this.filmRepository.save(film);

    actorRoles.map(({ actor, roleName, dto }) => {
      this.actorFilmRepository.create({actorId: actor.id, filmId: film.id, roleNotes: dto.role})
    })

  }

  find(dto: FilmQueryDTO) {
    return this.filmRepository.find({
      where: {
        // и как здесь фильтровать?
      },
      skip: dto.pagination.ofset,
      take: dto.pagination.limit,
    
    })
  };
}
