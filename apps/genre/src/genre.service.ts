import { ResponseDTO } from '@app/rabbit';
import { CreateGenreDTO, ParsedGenreDTO } from '@app/shared';
import { Genre } from '@app/shared';
import { UpdateGenreDto } from '@app/shared/dto/update-genre.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Equal, In, Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  private async findByName(genreName: string) {
    const genre = await this.genreRepository.findOneBy({ genreName });
    return genre;
  }

  async create(dto: CreateGenreDTO): Promise<ResponseDTO<Genre>> {
    const genre = await this.findByName(dto.genreName);
    if (genre) {
      return {
        status: 'error',
        error: 'Genre with such name already exist',
      };
    }

    const newGenre = await this.genreRepository.create(dto);
    await this.genreRepository.save(newGenre);
    return {
      status: 'ok',
      value: newGenre,
    };
  }

  private async ensureGenreExist(dto: ParsedGenreDTO): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: {
        genreName: Equal(dto.genreName),
      },
    });
    if (genre) {
      return genre;
    }

    const newGenre = await this.genreRepository.create(dto);
    return await this.genreRepository.save(newGenre);
  }

  async ensureAllGenresExists(genresDTO: ParsedGenreDTO[]): Promise<Genre[]> {
    const genres = genresDTO.map(
      async (dto) => await this.ensureGenreExist(dto),
    );
    return Promise.all(genres);
  }

  async getAll() {
    return this.genreRepository.find();
  }

  async getById(id: number): Promise<Genre> {
    return this.genreRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async getGenresByNames(genreNames: string[]): Promise<Genre[]> {
    return await this.genreRepository.find({
      where: {
        genreName: In(genreNames),
      },
    });
  }

  async getGenresByNamesEn(genreNamesEn: string[]): Promise<Genre[]> {
    return await this.genreRepository.find({
      where: {
        genreNameEn: In(genreNamesEn),
      },
    });
  }

  async updateGenre(dto: UpdateGenreDto): Promise<ResponseDTO<Genre>> {
    const genre = await this.getById(dto.id);
    if (genre) {
      genre.genreNameEn = dto.genreNameEn;
      await this.genreRepository.save(genre);
      return { status: 'ok', value: genre };
    }
    return {
      status: 'error',
      error: "Genre with such id doesn't exist",
    };
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.genreRepository.delete(id);
  }
}
