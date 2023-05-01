import { Test, TestingModule } from '@nestjs/testing';
import { ReviewParserService } from './review.parser.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import { DOMEN } from '../constants';
// eslint-disable-next-line
var _ = require('lodash');
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
    delete review.comments;

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

  it('should be able to parse comments for review', async () => {
    await page.goto(review1, {
      waitUntil: 'networkidle0',
    });
    const comments = await service.parseComments(page);
   
    const expected = [
      {
        "commentId": "1155555",
        "date": "6 сентября 2013, 16:52",
        "parentId": undefined,
        "text": "для меня малоубедительно.",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1155555/#comm1155555",
        "user": {
          "name": "cyberlaw",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/33806/2026005-59-477839.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/2026005/",
        },
      },
      {
        "commentId": "1446367",
        "date": "9 ноября 2014, 22:04",
        "parentId": "1155555",
        "text": "не хватает мозгов понять, что это",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1446367/#comm1446367",
        "user": {
          "name": "Sheemoozeeck",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/34118/954629-04-229914.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/954629/",
        },
      },
      {
        "commentId": "1452794",
        "date": "20 ноября 2014, 00:01",
        "parentId": "1446367",
        "text": "@Sheemoozeeck смешной комментарий, очень",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1452794/#comm1452794",
        "user": {
          "name": "cyberlaw",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/33806/2026005-59-477839.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/2026005/",
        },
      },
      {
        "commentId": "1227419",
        "date": "12 декабря 2013, 17:07",
        "parentId": undefined,
        "text": "Хм фильм на реальных событиях,",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1227419/#comm1227419",
        "user": {
          "name": "-EcLiPsE-",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/27708/946161-44-400456.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/946161/",
        },
      },
      {
        "commentId": "1287097",
        "date": "27 февраля 2014, 22:15",
        "parentId": undefined,
        "text": "О деньгах??",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1287097/#comm1287097",
        "user": {
          "name": "DinamiTT",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/69337/2137198-07-491933.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/2137198/",
        },
      },
      {
        "commentId": "1312811",
        "date": "4 апреля 2014, 00:17",
        "parentId": undefined,
        "text": "Главный герой рассказывает о несчастной",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1312811/#comm1312811",
        "user": {
          "name": "dbz",
          "photo": null,
          "url": "https://www.kinopoisk.ru/user/2371585/",
        },
      }, {
        "commentId": "1312875",
        "date": "4 апреля 2014, 07:43",
        "parentId": "1312811",
        "text": "Да причем тут зависть? Я делаю",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1312875/#comm1312875",
        "user": {
          "name": "Дмитрий Кожин",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/57335/1928945-10.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/1928945/",
        },
      }, {
        "commentId": "1534041",
        "date": "20 марта 2015, 14:53",
        "parentId": undefined,
        "text": "Все по теме абсолютно. Взывают",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1534041/#comm1534041",
        "user": {
          "name": "lowkick89",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/33806/2844182-37-301425.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/2844182/",
        },
      },
      {
        "commentId": "1584291",
        "date": "19 июня 2015, 14:32",
        "parentId": undefined,
        "text": "Рецензия прямо транслирует мои мысли",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1584291/#comm1584291",
        "user": {
          "name": "MaryJames",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/69337/617531-44-388736.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/617531/",
        },
      },
      {
        "commentId": "1605204",
        "date": "26 июля 2015, 15:16",
        "parentId": undefined,
        "text": "Черт, рецензия убедила, но и фильм",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/1605204/#comm1605204",
        "user": {
          "name": "GenneArt",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/27708/1477606-24-682768.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/1477606/",
        },
      }, {
        "commentId": "2439644",
        "date": "20 февраля 2021, 22:54",
        "parentId": undefined,
        "text": "Вообще не об этом…",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2439644/#comm2439644",
        "user": {
          "name": "Nadispb",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/28790/1009469-56-565657.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/1009469/",
        },
      }, {
        "commentId": "2462169",
        "date": "16 июля 2021, 11:29",
        "parentId": undefined,
        "text": "Ваша точка зрения имеет место быть, но,",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2462169/#comm2462169",
        "user": {
          "name": "Эльдар Горов",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/27708/75502679-21-974867.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/75502679/",
        },
      }, {
        "commentId": "2479510",
        "date": "7 декабря 2021, 09:43",
        "parentId": undefined,
        "text": "Автор, чвно, не читал и не слышал",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2479510/#comm2479510",
        "user": {
          "name": "Иван Плотников - 5289",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/28790/56750570-49-623079.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/56750570/",
        },
      }, {
        "commentId": "2488953",
        "date": "13 февраля 2022, 22:08",
        "parentId": undefined,
        "text": "Вау! А что не сравнить",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2488953/#comm2488953",
        "user": {
          "name": "Nadispb",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/28790/1009469-56-565657.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/1009469/",
        },
      }, {
        "commentId": "2495973",
        "date": "25 июля 2022, 20:07",
        "parentId": undefined,
        "text": "бред высказал, человек. абсолютный бред.",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2495973/#comm2495973",
        "user": {
          "name": "convall",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/1659927/2a0000016f388480b978cbbfbfe5dc114b5f/46x73",
          "url": "https://www.kinopoisk.ru/user/41829731/",
        },
      }, {
        "commentId": "2496730",
        "date": "4 августа 2022, 21:19",
        "parentId": undefined,
        "text": "Чтобы понять о чем фильм, достаточно",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2496730/#comm2496730",
        "user": {
          "name": "maxsmola",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/34118/2a000001668b9748f2c2e179f7df705e7751/46x73",
          "url": "https://www.kinopoisk.ru/user/15483429/",
        },
      },
      {
        "commentId": "2502575",
        "date": "14 октября 2022, 18:47",
        "parentId": undefined,
        "text": "Вы смотрели с какой-то обидной",
        "url": "https://www.kinopoisk.ru/user/1928945/comment/1496976/comm/2502575/#comm2502575",
        "user": {
          "name": "kapitan.ekler",
          "photo": "https://avatars.mds.yandex.net/get-kino-vod-users-avatar/69337/63778975-6-588178.jpg/46x73",
          "url": "https://www.kinopoisk.ru/user/63778975/",
        },
      },
    ];

    expect(comments.length).toBe(17);

    // тeкст комментария - из кучи тегов. Как там пробелы меж ними лягут
    // поэтому сравню только начало
    _.zip(
      comments.map((comment) => comment.text),
      expected.map((comment) => comment.text)
    ).forEach(([comment, start]) => {
      expect(comment).toContain(start)
    });
    

      
    expect(
      comments.map((comment) => ({ ...comment, text: undefined }))
    ).toEqual(expected.map((comment) => ({ ...comment, text: undefined })));
    
  }, 40000);

  afterEach(async () => {
    mock.restore();
    await page.close();
    await browser.close();
  });
});
