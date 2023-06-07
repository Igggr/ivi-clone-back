import { Test, TestingModule } from '@nestjs/testing';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FILM, GENRE, PROFILES } from '@app/rabbit';
import { ActorService } from './actor/actor.service';
import {
  Film,
  Actor,
  ActorFilm,
  ActorRole,
  Country,
  Review,
  AgeRestriction,
  Comment,
  FilmViewsCountry,
} from '@app/shared';
import { ActorRoleService } from './actor.role/actor.role.service';
import { CountryService } from './country/country.service';
import { ReviewService } from './review/review.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';
import { FilmGenre } from '@app/shared/entities/film-genre.entity';
import { CommentService } from './comment/comment.service';
import { ParserSaverService } from './parser.saver/parser.saver.service';

describe('FilmController', () => {
  let filmController: FilmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FilmController],
      providers: [
        ActorService,
        ActorRoleService,
        CountryService,
        ReviewService,
        AgeRestrictionService,
        CommentService,
        ParserSaverService,
        {
          provide: 'ActorService',
          useValue: {},
        },
        FilmService,
        {
          provide: getRepositoryToken(Film),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FilmGenre),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Actor),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ActorFilm),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ActorRole),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Country),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Review),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AgeRestriction),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FilmViewsCountry),
          useValue: {},
        },
        {
          provide: FILM,
          useValue: {},
        },
        {
          provide: PROFILES,
          useValue: {}, // mock rabbit client
        },
        {
          provide: GENRE,
          useValue: {}, // mock rabbit client
        },
      ],
    })
      .overrideProvider('ActorService')
      .useValue({})
      .compile();

    filmController = app.get<FilmController>(FilmController);
  });

  describe('root', () => {
    it('should be defined"', () => {
      expect(filmController.getFilms).toBeDefined();
    });
  });
});
