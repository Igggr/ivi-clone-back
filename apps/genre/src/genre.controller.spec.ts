import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from '@app/shared';

describe('GenreController', () => {
  let genreController: GenreController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [
        GenreService,
        {
          provide: getRepositoryToken(Genre),
          useValue: {},
        },
      ],
    }).compile();

    genreController = app.get<GenreController>(GenreController);
  });

  describe('root', () => {
    it('should be defined"', () => {
      expect(genreController.updateGenre).toBeDefined();
    });
  });
});
