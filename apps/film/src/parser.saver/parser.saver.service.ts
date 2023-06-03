import {
  Film,
  FilmViewsCountry,
  Genre,
  ParsedFilmDTO,
  ParsedProfileDTO,
  ParsedReviewDTO,
  Profile,
} from '@app/shared';
import { FilmGenre } from '@app/shared/entities/film-genre.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActorService } from '../actor/actor.service';
import { CountryService } from '../country/country.service';
import { ReviewService } from '../review/review.service';
import { ClientProxy } from '@nestjs/microservices';
import { AgeRestrictionService } from '../age.restriction/age.restriction.service';
import {
  CREATE_PROFILE_WITH_DUMMY_USER,
  ENSURE_ALL_GENRES_EXISTS,
  ErrorDTO,
  GENRE,
  PROFILES,
} from '@app/rabbit';
import { firstValueFrom } from 'rxjs';
import { ParsedViewDTO } from '@app/shared/dto/parser.dto/parsed-views.dto';

@Injectable()
export class ParserSaverService {
  constructor(
    private readonly actorService: ActorService,
    private readonly countryService: CountryService,
    private readonly reviewService: ReviewService,
    private readonly restrictionService: AgeRestrictionService,
    @Inject(GENRE) private readonly genreClient: ClientProxy,
    @Inject(PROFILES) private profileClient: ClientProxy,
    @InjectRepository(Film)
    private readonly filmRepository: Repository<Film>,
    @InjectRepository(FilmGenre)
    private readonly filmGenreRepository: Repository<FilmGenre>,
    @InjectRepository(FilmViewsCountry)
    private readonly filmViewsRepository: Repository<FilmViewsCountry>,
  ) {}

  async createFromParsedData(dto: ParsedFilmDTO) {
    console.log('Creating films from parsed data');

    const country = await this.countryService.ensureCountry(dto.country);
    const genres: Genre[] = await firstValueFrom(
      this.genreClient.send({ cmd: ENSURE_ALL_GENRES_EXISTS }, dto.genres),
    );

    const ageRestriction = await this.restrictionService.ensureRestrictionExist(
      dto.ageRestriction,
    );

    const film = this.filmRepository.create({
      ...dto,
      filmGenres: undefined,
      reviews: undefined,
      views: undefined,
      country: country,
      ageRestriction: ageRestriction,
    });

    await this.filmRepository.save(film);
    await this.addGenresToFilm(film, genres);

    await this.actorService.saveParsedActors(film.id, dto.persons);

    const profiles = await this.getProfiles(dto.reviews);
    await this.reviewService.saveParsedReviews(dto.reviews, profiles, film.id);

    await this.saveParsedViews(dto.views, film);
    return film;
  }

  private async addGenresToFilm(film: Film, genres: Genre[]) {
      const filmGenre = this.filmGenreRepository.create(
          genres.map((genre) => ({ genreId: genre.id, filmId: film.id })),
      );
      await this.filmGenreRepository.save(filmGenre);
  }

  // создает все профили, которые есть в ревью / комментариях
  // чтобы не вызывать rabbit / БД лишний раз - они кешируются в словаре profiles
  private async getProfiles(
    dtos: ParsedReviewDTO[],
  ): Promise<Map<string, Profile>> {
    const profiles = new Map<string, Profile>();

    for (const dto of dtos) {
      await this.ensureProfile(profiles, dto.profile);
      for (const comment of dto.comments) {
        await this.ensureProfile(profiles, comment.profile);
      }
    }

    return profiles;
  }

  private async ensureProfile(
    profiles: Map<string, Profile>,
    dto: ParsedProfileDTO,
  ): Promise<Profile> {
    if (profiles.has(dto.url)) {
      return profiles.get(dto.url);
    }
    const response: ErrorDTO | {
      token: string;
      profileInfo: Profile;
    } = await firstValueFrom(
      this.profileClient.send({ cmd: CREATE_PROFILE_WITH_DUMMY_USER }, dto),
      );
    if ('profileInfo' in response) {
      profiles.set(dto.url, response.profileInfo);
      return response.profileInfo;
    }
  }

  async saveParsedViews(parsedViews: ParsedViewDTO[], film: Film) {
    for (const dto of parsedViews) {
      const country = await this.countryService.ensureCountry(dto.country);
      const view = this.filmViewsRepository.create({
        ...dto,
        country,
        film,
        viewersCount: dto.views,
      });
      await this.filmViewsRepository.save(view);
    }
  }
}
