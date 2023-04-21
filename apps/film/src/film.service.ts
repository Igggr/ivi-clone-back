import { FilmQueryDTO, ParsedFilmDTO } from '@app/shared';
import { Film } from '@app/shared/entities/film.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActorService } from './actor/actor.service';
import { CountryService } from './country/country.service';
import { ReviewService } from './review/review.service';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    private readonly actorService: ActorService,
    private readonly countryService: CountryService,
    private readonly revieWService: ReviewService,
  ) {}

  async createFromParsedData(dto: ParsedFilmDTO) {
    console.log('Creating films from parsed data');

    const country = await this.countryService.ensureCountry(dto.country);

    const film = this.filmRepository.create({
      url: dto.url,
      title: dto.title,
      originalTitle: dto.originalTitle,
      year: dto.year,
      slogan: dto.slogan,
      countryId: country.id,
      duration: dto.duration,
    });

    await this.filmRepository.save(film);

    const actorRoles = await this.actorService.bulkCreate(film.id, dto.persons);

    await this.revieWService.createReviews();
  }

  find(dto: FilmQueryDTO) {
    return this.filmRepository.find({
      where: {
        // и как здесь фильтровать?
      },
      skip: dto.pagination.ofset,
      take: dto.pagination.limit,
    });
  }
}
