import { FilmQueryDTO, ParsedFilmDTO } from '@app/shared';
import { Film } from '@app/shared/entities/film.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActorService } from './actor/actor.service';
import { CountryService } from './country/country.service';
import { ReviewService } from './review/review.service';
import { GenreService } from './genre/genre.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    private readonly actorService: ActorService,
    private readonly countryService: CountryService,
    private readonly revieWService: ReviewService,
    private readonly genreService: GenreService,
    private readonly restrictionService: AgeRestrictionService,
  ) {}

  async createFromParsedData(dto: ParsedFilmDTO) {
    console.log('Creating films from parsed data');

    const country = await this.countryService.ensureCountry(dto.country);
    const genres = await this.genreService.ensureAllGenresExists(dto.genres);
    const ageRestriction = await this.restrictionService.ensureRestrictionExist(
      dto.ageRestriction,
    );

    const film = this.filmRepository.create({
      url: dto.url,
      title: dto.title,
      originalTitle: dto.originalTitle,
      year: dto.year,
      genres,
      slogan: dto.slogan,
      countryId: country.id,
      duration: dto.duration,
      ageRestriction,
    });

    await this.filmRepository.save(film);

    await this.actorService.bulkCreate(film.id, dto.persons);

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
