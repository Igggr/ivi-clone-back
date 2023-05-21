import { Test, TestingModule } from '@nestjs/testing';
import { MainPageParserService } from './main-page.parser.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import { DOMEN } from '../constants';

// eslint-disable-next-line
const mockPuppeteerGoto = require('mock-puppeteer-goto');

describe('Main page parser', () => {
  let service: MainPageParserService;
  let browser: Browser;
  let page: Page;
  const film = 326;
  let mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainPageParserService],
    }).compile();

    service = module.get<MainPageParserService>(MainPageParserService);

    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();

    mock = mockPuppeteerGoto(page, {
      paths: {
        [`${DOMEN}/film/${film}/`]:
          'apps/parser/src/main-page.parser/main-page.html',
        [`${DOMEN}/film/${film}/cast`]:
          'apps/parser/src/actro.parser/actor.html',
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse main page', async () => {
    const result = await service.parseMainPage(page, film);
    const expected = {
      url: 'https://www.kinopoisk.ru/film/326/',
      title: 'Побег из Шоушенка',
      originalTitle: 'The Shawshank Redemption',
      year: 1994,
      slogan: '«Страх - это кандалы. Надежда - это свобода»',
      genres: [
        {
          genreName: 'драма',
          genreNameEn: 'drama',
          url: 'https://www.kinopoisk.ru/lists/movies/genre--drama/?b=films&b=top',
        },
      ],
      country: {
        countryName: 'США',
        url: 'https://www.kinopoisk.ru/lists/movies/country--1/?b=films&b=top',
      },
      duration: '142 minutes',
      ageRestriction: {
        abbreviation: 'R',
        description: 'лицам до 17 лет обязательно присутствие взрослого',
        minAge: '16+',
        url: 'https://www.kinopoisk.ru//film/326/rn/R/',
      },
    };
    expect(result).toEqual(expected);
  }, 10000);

  afterEach(async () => {
    mock.restore();
    await page.close();
    await browser.close();
  });
});
