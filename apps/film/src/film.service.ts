import { FilmQueryDTO } from '@app/database/dto';
import { FilmEntity } from '@app/database/entities/film.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly filmRepository: Repository<FilmEntity>
  ) { }
  
  find(dto: FilmQueryDTO) {
    return this.filmRepository.find({
      where: {
        // и как здесь фильтровать?
      },
      skip: dto.pagination.ofset,
      take: dto.pagination.limit,
    
    })
  }
}
