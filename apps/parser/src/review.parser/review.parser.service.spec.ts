import { Test, TestingModule } from '@nestjs/testing';
import { ReviewParserService } from './review.parser.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import { DOMEN } from '../constants';

// eslint-disable-next-line
const mockPuppeteerGoto = require('mock-puppeteer-goto');

describe('ReviewParserService', () => {
  let service: ReviewParserService;
  let browser: Browser;
  let page: Page;
  let mock;

  const film = 326;
  const reviews1 = `${DOMEN}/film/${film}/reviews/ord/date/status/all/perpage/10/page/1/`;
  const reviews2 = `${DOMEN}/film/${film}/reviews/ord/date/status/all/perpage/10/page/2/`;
  const review1 = `${DOMEN}/user/1928945/comment/1496976/`;
  const review2 = `${DOMEN}/user/14532395/comment/3250487/`;
  const review3 = `${DOMEN}/user/15269042/comment/2821527/`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewParserService],
    }).compile();

    service = module.get<ReviewParserService>(ReviewParserService);
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();

    mock = mockPuppeteerGoto(page, {
      paths: {
        [reviews1]: 'apps/parser/src/review.parser/review-list-1.html',
        [reviews2]: 'apps/parser/src/review.parser/review-list-2.html',
        [review1]: 'apps/parser/src/review.parser/review-1.html',
        [review2]: 'apps/parser/src/review.parser/review-2.html',
        [review3]: 'apps/parser/src/review.parser/review-3.html',
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get review links for one page', async () => {
    await page.goto(reviews1, {
      waitUntil: 'networkidle0',
    });
    const urls = await service.getReviewLinksForOnePage(page);
    const expected = [review1, review2];
    expect(urls).toEqual(expected);
  }, 10000);

  it('should get all review links', async () => {
    await page.goto(reviews1, {
      waitUntil: 'networkidle0',
    });
    const urls = await service.getAllReviewLinks(page, film);
    const expected = [review1, review2, review3];
    expect(urls).toEqual(expected);
  }, 40000); // даже тесты тормозные и не укладывааются в 5 секунд, хотя никаких заросв нет. Как сайт парсить? По часу на фильм?

  it('should be able to parse review', async () => {
    const review = await service.parseOneReview(page, review1);
    expect(review.body).toContain('Рискуя вызвать критику');

    delete review.body;

    const expected = {
      title: 'Фактор денег',
      url: 'https://www.kinopoisk.ru/user/1928945/comment/1496976/',
      user: {
        url: 'https://www.kinopoisk.ru/user/1928945/',
        userName: 'Дмитрий Кожин',
      },
    };

    expect(review).toEqual(expected);
  }, 40000);

  afterEach(async () => {
    mock.restore();
    await page.close();
    await browser.close();
  });
});
