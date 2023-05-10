import { Test, TestingModule } from '@nestjs/testing';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FILM } from '@app/rabbit';
import { ActorService } from './actor/actor.service';
import {
  Film,
  Actor,
  ActorFilm,
  ActorRole,
  Country,
  Genre,
  Review,
  AgeRestriction,
} from '@app/shared';
import { ActorRoleService } from './actor.role/actor.role.service';
import { CountryService } from './country/country.service';
import { ReviewService } from './review/review.service';
import { AgeRestrictionService } from './age.restriction/age.restriction.service';

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
          provide: 'CountryService',
          useValue: {},
        },
        {
          provide: FILM,
          useValue: {},
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
