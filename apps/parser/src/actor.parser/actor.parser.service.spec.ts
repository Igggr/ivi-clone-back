import { Test, TestingModule } from '@nestjs/testing';
import { ActorParserService } from './actor.parser.service';
import { actorsXpath, directorsXpath, editorsXpath } from '../xpath/role';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ParsedActorDTO } from '@app/shared';
import { DOMEN } from '../constants';
// eslint-disable-next-line
const mockPuppeteerGoto = require('mock-puppeteer-goto');

describe('ActorParserService', () => {
  let service: ActorParserService;
  let browser: Browser;
  let page: Page;
  const url = `${DOMEN}/film/326/cast`;
  let mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActorParserService],
    }).compile();

    service = module.get<ActorParserService>(ActorParserService);

    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();

    mock = mockPuppeteerGoto(page, {
      paths: {
        [url]: 'apps/parser/src/actor.parser/actor.html',
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse directors', async () => {
    await page.goto(url);

    const directors: ParsedActorDTO[] = await service.parsePersonsWithRole(
      page,
      directorsXpath,
    );
    const expected = [
      {
        fullName: 'Фрэнк Дарабонт',
        fullNameEn: 'Frank Darabont',
        photo: 'https://www.kinopoisk.ru/images/sm_actor/24262.jpg',
        role: '',
        url: 'https://www.kinopoisk.ru/name/24262/',
      },
    ];

    expect(directors).toEqual(expected);
    mock.restore();
  });

  it('should parse actors', async () => {
    await page.goto(url);

    const actors: ParsedActorDTO[] = await service.parsePersonsWithRole(
      page,
      actorsXpath,
      true,
    );
    const expected = [
      {
        dub: [
          {
            fullName: 'Диомид Виноградов',
            photo:
              'https://www.kinopoisk.ruhttps://st.kp.yandex.net/images/sm_actor/1781077.jpg',
            role: '... Andy Dufresne',
            url: 'https://www.kinopoisk.ru/name/1781077/',
          },
          {
            fullName: 'Иван Литвиненко',
            photo:
              'https://www.kinopoisk.ruhttps://st.kp.yandex.net/images/sm_actor/1826342.jpg',
            role: '... Andy Dufresne',
            url: 'https://www.kinopoisk.ru/name/1826342/',
          },
        ],
        fullName: 'Тим Роббинс',
        fullNameEn: 'Tim Robbins',
        photo: 'https://www.kinopoisk.ru/images/sm_actor/7987.jpg',
        role: '... Andy Dufresne',
        url: 'https://www.kinopoisk.ru/name/7987/',
      },
      {
        dub: [
          {
            fullName: 'Игорь Старосельцев',
            photo:
              'https://www.kinopoisk.ruhttps://st.kp.yandex.net/images/sm_actor/701366.jpg',
            role: '... Ellis Boyd «Red» Redding',
            url: 'https://www.kinopoisk.ru/name/701366/',
          },
        ],
        fullName: 'Морган Фриман',
        fullNameEn: 'Morgan Freeman',
        photo: 'https://www.kinopoisk.ru/images/sm_actor/6750.jpg',
        role: '... Ellis Boyd «Red» Redding',
        url: 'https://www.kinopoisk.ru/name/6750/',
      },
    ];

    expect(actors).toEqual(expected);
  });

  it('should parse editors', async () => {
    await page.goto(url);

    const directors: ParsedActorDTO[] = await service.parsePersonsWithRole(
      page,
      editorsXpath,
    );
    const expected = [
      {
        fullName: 'Ричард Фрэнсис-Брюс',
        fullNameEn: 'Richard Francis-Bruce',
        photo: 'https://www.kinopoisk.ru/images/sm_actor/1986116.jpg',
        role: '',
        url: 'https://www.kinopoisk.ru/name/1986116/',
      },
    ];

    expect(directors).toEqual(expected);
    mock.restore();
  });

  afterEach(async () => {
    mock.restore();
    await page.close();
    await browser.close();
  });
});
