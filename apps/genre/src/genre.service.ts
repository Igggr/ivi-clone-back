import { ResponseDTO } from '@app/rabbit';
import { CreateGenreDTO } from '@app/shared';
import { Genre } from '@app/shared';
import { UpdateGenreDto } from '@app/shared/dto/update-genre.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  private async ensureGenreExist(dto: CreateGenreDTO): Promise<Genre> {
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

  async ensureAllGenresExists(genresDTO: CreateGenreDTO[]): Promise<Genre[]> {
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
}
