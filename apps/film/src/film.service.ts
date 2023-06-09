import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { DeleteResult, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import {
  GENRE,
  ResponseDTO,
  GET_GENRES_BY_NAMES,
  GET_GENRES,
  GET_GENRES_BY_NAMES_EN,
} from '@app/rabbit';
import {
  Film,
  FilmQueryDTO,
  Genre,
  CreateFilmDTO,
  UpdateFilmDTO,
  CountryWithThisNameNotFound,
  FilmGenre,
  SomeGenresNotFound,
} from '@app/shared';
import { CountryService } from './country/country.service';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(FilmGenre)
    private readonly filmGenreRepository: Repository<FilmGenre>,
    private readonly countryService: CountryService,
    @Inject(GENRE) private readonly genreClient: ClientProxy,
  ) {}

  async find(dto: FilmQueryDTO) {
    if (dto.filter.genres.length === 0) {
      const res = await this.filmRepository
        .createQueryBuilder('films')
        .offset(dto.pagination.ofset)
        .take(dto.pagination.limit)
        .getMany();
      return res;
    }

    // console.log(dto)
    const genres = await this.findGenresByNamesEn(dto.filter.genres);
    // console.log('Get only films with all this genres:', dto, genres)
    if (dto.filter.genres.length !== genres.length) {
      return {
        status: 'error',
        error: SomeGenresNotFound,
      };
    }
    const genreIds = genres.map((g) => g.id);

    // чтобы получить фильмы у кторых есть все указанные жанры
    // сначала отфильтруй filmGenre, по жанрам
    // а потом сгруппируй по фильму и оставь только те фильмыэ
    // у которым соотвествует то же количество жанров
    const rightfilms = await this.filmRepository
      .createQueryBuilder('films')
      .leftJoinAndSelect('films.filmGenres', 'fg')
      .where('fg.genreId IN(:...genreIds)', { genreIds })
      .groupBy('films.id')
      .having('COUNT(fg.genreId) = 2')
      .select('films.id', 'id')
      .addSelect('films.title')
      .getRawMany();

    const res = await this.filmRepository
      .createQueryBuilder('films')
      .where('films.id IN(:...ids)', { ids: rightfilms.map((film) => film.id) })
      .offset(dto.pagination.ofset)
      .take(dto.pagination.limit)
      .getMany();

    return res;
  }

  async findOneById(id: number): Promise<Film> {
    const film = await this.filmRepository
      .createQueryBuilder('film')
      .where('film.id = :id', { id })
      .leftJoinAndSelect('film.reviews', 'reviews')
      .leftJoinAndSelect('reviews.comments', 'commetns')
      .getOne();
    return film;
  }

  async getAllGenres(): Promise<Genre[]> {
    const genres: Genre[] = await firstValueFrom(
      this.genreClient.send({ cmd: GET_GENRES }, {}),
    );
    return genres;
  }

  async findGenresByNames(genreNames: string[]): Promise<Genre[]> {
    const genres: Genre[] = await firstValueFrom(
      this.genreClient.send({ cmd: GET_GENRES_BY_NAMES }, genreNames),
    );
    return genres;
  }

  async findGenresByNamesEn(genreNames: string[]): Promise<Genre[]> {
    const genres: Genre[] = await firstValueFrom(
      this.genreClient.send({ cmd: GET_GENRES_BY_NAMES_EN }, genreNames),
    );
    return genres;
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
          error: CountryWithThisNameNotFound,
        };
      }
    }

    if (dto.genreNames) {
      const genres = await this.findGenresByNames(dto.genreNames);
      if (genres.length < dto.genreNames.length) {
        return {
          status: 'error',
          error: SomeGenresNotFound,
        };
      }
      await this.filmRepository.save(film);
      await this.addGenresToFilm(film, genres);
    }

    await this.filmRepository.save(film);
    return {
      status: 'ok',
      value: film,
    };
  }

  async update(dto: UpdateFilmDTO): Promise<ResponseDTO<Film>> {
    const film = await this.filmRepository.findOneBy({ id: dto.id });
    if (!film) {
      return {
        status: 'error',
        error: "Film with such id doesn't exist",
      };
    }
    if (dto.countryName) {
      const country = await this.countryService.findByName(dto.countryName);
      if (country) {
        film.country = country;
      } else {
        return {
          status: 'error',
          error: CountryWithThisNameNotFound,
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
  }

  async addGenresToFilm(film: Film, genres: Genre[]): Promise<void> {
    const dtos = genres.map((genre) => ({
      genreId: genre.id,
      filmId: film.id,
    }));
    const filmGenres = this.filmGenreRepository.create(dtos);
    await this.filmGenreRepository.save(filmGenres);
  }
}
