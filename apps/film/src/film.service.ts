import { FilmQueryDTO, Genre, ParsedFilmDTO } from '@app/shared';
import { Film } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActorService } from './actor/actor.service';
import { CountryService } from './country/country.service';
import { ReviewService } from './review/review.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';
import { ClientProxy } from '@nestjs/microservices';
import { ENSURE_ALL_GENRES_EXISTS, FILM, GENRE, GET_GENRES_BY_NAME } from '@app/rabbit';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FilmService {
  constructor(
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    private readonly actorService: ActorService,
    private readonly countryService: CountryService,
    private readonly revieWService: ReviewService,
    @Inject(GENRE) private readonly client: ClientProxy,
    private readonly restrictionService: AgeRestrictionService,
  ) {}

  async createFromParsedData(dto: ParsedFilmDTO) {
    console.log('Creating films from parsed data');

    const country = await this.countryService.ensureCountry(dto.country);
    const genres = await firstValueFrom(
      this.client.send({ cmd: ENSURE_ALL_GENRES_EXISTS }, dto.genres),
    );

    const ageRestriction = await this.restrictionService.ensureRestrictionExist(
      dto.ageRestriction,
    );

    const film = this.filmRepository.create({
      url: dto.url,
      title: dto.title,
      originalTitle: dto.originalTitle,
      year: dto.year,
      filmGenres: genres,
      slogan: dto.slogan,
      countryId: country.id,
      duration: dto.duration,
      ageRestrictionId: ageRestriction.id,
    });

    await this.filmRepository.save(film);

    await this.actorService.bulkCreate(film.id, dto.persons);

    const reviews = dto.reviews.map((review) => ({
      ...review,
      filmId: film.id,
    }));
    await this.revieWService.createReviews(reviews, film.id);
  }

  async find(dto: FilmQueryDTO) {

    const genres: Genre[] = await firstValueFrom(
      this.client.send({ cmd: GET_GENRES_BY_NAME }, dto.genres)
    );
    return this.filmRepository.find({
      where: {
        filmGenres: {
          genreId: In(genres),
        },
      },
      relations: ['filmGenres'],
      skip: dto.pagination.ofset,
      take: dto.pagination.limit,
    });
  }
}
