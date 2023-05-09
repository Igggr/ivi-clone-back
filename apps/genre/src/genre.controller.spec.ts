import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';

describe('GenreController', () => {
  let genreController: GenreController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [GenreService],
    }).compile();

    genreController = app.get<GenreController>(GenreController);
  });

  describe('root', () => {
    it('should be defined"', () => {
      expect(genreController.updateGenre).toBeDefined();
    });
  });
});
