import { Test, TestingModule } from '@nestjs/testing';
import { MainPageParserService } from './main-page.parser.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import { DOMEN } from '../constants';

// eslint-disable-next-line
const mockPuppeteerGoto = require('mock-puppeteer-goto');

describe('ActorParserService', () => {
  let service: MainPageParserService;
  let browser: Browser;
  let page: Page;
  const film = 326;
  const url = `${DOMEN}/film/${film}/cast`;
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
        [url]: 'apps/parser/src/main-page.parser/main-page.html',
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('should parse main page', async () => {
    const result = await service.parseMainPage(page, film);
    const expected = {
      url: "https://www.kinopoisk.ru/film/326/",
      title: 'Побег из Шоушенка',
      originalTitle: 'The Shawshank Redemption',
      year: 1994,
      slogan: '«Страх - это кандалы. Надежда - это свобода»',
      genres: ['драма'],
      country: {
        countryName: "США",
        url: "https://www.kinopoisk.ru/lists/movies/country--1/?b=films&b=top",
      },
      duration: "142 minutes",
      ageRestriction: {
        abbreviation: "R",
        description: "лицам до 17 лет обязательно присутствие взрослого",
        minAge: "16+",
        url: "https://www.kinopoisk.ru//film/326/rn/R/",
      },
    };
    expect(result).toEqual(expected);
  },
  10000)

  afterEach(async () => {
    mock.restore();
    await page.close();
    await browser.close();
  })
});
