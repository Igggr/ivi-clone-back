import { CreateGenreDTO } from '@app/shared';
import { Genre } from '@app/shared/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

@Injectable()
export class GenreService {
    constructor(
        @InjectRepository(Genre)
        private readonly genreRepository: Repository<Genre>,
    ) { }
    

    private async ensureGenreExist(dto: CreateGenreDTO) {
        const genre = this.genreRepository.findOne({
            where: {
                genreName: Equal(dto.genreName),
            }
        })
        if (genre) {
            return genre;
        }
        const newGenre = await this.genreRepository.create({ genreName: dto.genreName, genreNameEn: dto.genreNameEn });;
        return await this.genreRepository.save(newGenre);

    }

    async ensureAllGenresExist(genresDTO: CreateGenreDTO[]) {
        const genres = await Promise.all(genresDTO.map((dto) => this.ensureGenreExist(dto)));
        return genres;
    }


}
