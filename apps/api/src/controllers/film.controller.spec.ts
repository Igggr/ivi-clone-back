import { Test, TestingModule } from '@nestjs/testing';
import { FilmController } from './film.controller';
import { FILM } from '@app/rabbit';

describe('FilmController', () => {
  let controller: FilmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmController],
      providers: [
        {
          provide: FILM,
          useValue: {}
        }
      ]
    }).overrideProvider(FILM).useValue({}).compile();

    controller = module.get<FilmController>(FilmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
