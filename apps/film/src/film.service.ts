import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { DeleteResult, In, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { GENRE, ResponseDTO, GET_GENRES_BY_NAMES } from '@app/rabbit';
import {
  Film,
  FilmQueryDTO,
  Genre,
  CreateFilmDTO,
  UpdateFilmDTO,
  FilmGenre,
} from '@app/shared';
import { CountryService } from './country/country.service';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(FilmGenre)
    private readonly countryService: CountryService,
    @Inject(GENRE) private readonly genreClient: ClientProxy,
  ) {}

  async find(dto: FilmQueryDTO) {
    const genres: Genre[] = await firstValueFrom(
      this.genreClient.send(
        {
          cmd: GET_GENRES_BY_NAMES,
        },
        dto.genres,
      ),
    );
    return this.filmRepository.find({
      where: {
        filmGenres: {
          genreId: In(genres.map((genre) => genre.id)),
        },
      },
      relations: ['filmGenres'],
      skip: dto.pagination.ofset,
      take: dto.pagination.limit,
    });
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.filmRepository.delete(id);
  }

  async create(dto: CreateFilmDTO): Promise<ResponseDTO<Film>> {
    const film = this.filmRepository.create(dto);
    if (dto.countryName) {
      const country = await this.countryService.findByName(dto.countryName);
      if (country) {
        film.country = country;
      } else {
        return {
          status: 'error',
          error: 'Страны с таким countryName не существует',
        };
      }
    }

    await this.filmRepository.save(film);
    return {
      status: 'ok',
      value: film,
    };
  }

  async update(dto: UpdateFilmDTO): Promise<ResponseDTO<Film>> {
    const film = await this.filmRepository.findOneBy({ id: dto.id });
    if (film) {
      if (dto.countryName) {
        const country = await this.countryService.findByName(dto.countryName);
        if (country) {
          film.country = country;
        } else {
          return {
            status: 'error',
            error: 'Страны с таким countryName не существует',
          };
        }
      }

      film.title = dto.title ?? film.title;
      film.originalTitle = dto.originalTitle ?? film.title;
      film.slogan = dto.slogan ?? film.slogan;
      film.year = dto.year ?? film.year;
      film.duration = dto.duration ?? film.duration;

      await this.filmRepository.save(film);
      return {
        status: 'ok',
        value: film,
      };
    } else {
      return {
        status: 'error',
        error: "Film with such id doesn't exist",
      };
    }
  }
}
