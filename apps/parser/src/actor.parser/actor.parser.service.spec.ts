import { Test, TestingModule } from '@nestjs/testing';
import { ActorParserService } from './actor.parser.service';
import { actorsXpath } from '../xpath/role';
import puppeteer, { Browser, Page } from 'puppeteer';
import { CreateActorDTO, ParsedActorDTO } from '@app/shared';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockPuppeteerGoto = require('mock-puppeteer-goto');

describe('ActorParserService', () => {
  let service: ActorParserService;
  let browser: Browser;
  let page: Page;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActorParserService],
    }).compile();

    service = module.get<ActorParserService>(ActorParserService);

    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();
  });

  it('should parse actors', async () => {
    const mock = mockPuppeteerGoto(page, {
      paths: {
        'http://url.com': 'apps/parser/src/actor.parser/actor.html',
      },
    });
    await page.goto('http://url.com');

    const actors: ParsedActorDTO[] = await service.parsePersonsWithRole(
      page,
      actorsXpath,
      true,
    );
    const expected = [
      {
        dub: [
        {
          "fullName": "Диомид Виноградов",
          "photo": "https://www.kinopoisk.ruhttps://st.kp.yandex.net/images/sm_actor/1781077.jpg",
          "role": "... Andy Dufresne",
          "url": "https://www.kinopoisk.ru/name/1781077/",
        },
        {
          "fullName": "Иван Литвиненко",
          "photo": "https://www.kinopoisk.ruhttps://st.kp.yandex.net/images/sm_actor/1826342.jpg",
          "role": "... Andy Dufresne",
          "url": "https://www.kinopoisk.ru/name/1826342/",
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
            "fullName": "Игорь Старосельцев",
            "photo": "https://www.kinopoisk.ruhttps://st.kp.yandex.net/images/sm_actor/701366.jpg",
            "role": "... Ellis Boyd «Red» Redding",
            "url": "https://www.kinopoisk.ru/name/701366/"
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
    mock.restore();
  });

  afterEach(async () => {
    await page.close();
    await browser.close();
  });
});
