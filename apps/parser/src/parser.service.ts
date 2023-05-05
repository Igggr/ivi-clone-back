import puppeteer, { Page } from 'puppeteer';
import { premierXpath } from './xpath/main-page';
import {
  previewElement,
  previewFrame,
  previewPageXPath,
} from './xpath/trailer';
import { Injectable } from '@nestjs/common';
import { ParsedFilmDTO } from '@app/shared';
import { ResponseDTO } from '@app/rabbit';
import { ActorParserService } from './actor.parser/actor.parser.service';
import { ReviewParserService } from './review.parser/review.parser.service';
import { MainPageParserService } from './main-page.parser/main-page.parser.service';
import { DOMEN } from './constants';

@Injectable()
export class ParserService {
  constructor(
    private readonly actorParserService: ActorParserService,
    private readonly reviewParserService: ReviewParserService,
    private readonly mainPageParserService: MainPageParserService,
  ) {}

  async parse(film: number): Promise<ResponseDTO<ParsedFilmDTO>> {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });

    console.log(`Start parseing film ${film}`);
    const page = await browser.newPage();

    await this.optimizePageLoad(page);

    try {
      const mainPageInfo = await this.mainPageParserService.parseMainPage(
        page,
        film,
      );
      const preview = await this.getPreview(page, film);
      const views = await this.parseViews(page, film);
      const persons = await this.actorParserService.parsePersons(page, film);
      console.log('Спарсил persons');
      const reviews = await this.reviewParserService.parseReviews(page, film);
      console.log('Спарсил комменты');

      const res = { ...mainPageInfo, persons, views, preview, reviews };
      return { status: 'ok', value: res };
    } catch (e) {
      return { status: 'error', error: e.message };
    } finally {
      await page.close();
      await browser.close();
    }
  }

  async optimizePageLoad(page: Page) {
    // не нужно грузить стили и картинки
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const blockedTypes = ['image', 'stylesheet', 'font', 'media'];
      const blockResourceName = [
        'adition',
        'adzerk',
        'analytics',
        'cdn.api.twitter',
        'clicksor',
        'clicktale',
        'doubleclick',
        'exelator',
        'facebook',
        'fontawesome',
        'google',
        'google-analytics',
        'googletagmanager',
        'mixpanel',
        'optimizely',
        'quantserve',
        'sharethrough',
        'tiqcdn',
        'zedo',
      ];
      const requestUrl = request.url().split('?')[0];
      if (
        blockedTypes.includes(resourceType) ||
        blockResourceName.some((resource) => requestUrl.includes(resource))
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  private async getPreview(page: Page, film: number) {
    console.log('Патаюсь спаристь preview');
    try {
      const url = await page
        .$(`xpath/${previewPageXPath(film)}`)
        .then((handle) => handle.evaluate((node) => node.getAttribute('href')));
      console.log(`Navigating to ${DOMEN}${url}`);
      await page.goto(`${DOMEN}${url}`, {
        waitUntil: 'networkidle0',
      });

      await page.click(`xpath/${previewElement}`);
      const src = await page
        .$(`xpath/${previewFrame(film)}`)
        .then((handle) => handle.evaluate((el) => el.getAttribute('src')));
      console.log(`Успешно спарсил preview для ${film}`);
      return src;
    } catch {
      console.log(`Не удалось спарить preview для ${film}`);
      return null;
    }
  }

  private async parseViews(page: Page, film: number) {
    const datesUrl = `${DOMEN}/film/${film}/dates/`;

    console.log(`Паршу views, navigate to ${datesUrl}`);
    await page.goto(datesUrl, {
      waitUntil: 'networkidle0',
    });

    const views = await Promise.all(
      await page.$x(premierXpath).then((handles) =>
        handles.map(async (handle) => ({
          date: await handle.$eval('td>span>b', (node) => node.textContent),
          country: {
            country: await handle.$eval('td>a', (node) => node.textContent),
            countryLink: await handle.$eval(
              'xpath/td/a[starts-with(@href, "/lists/m_act")]',
              (node) => node.getAttribute('href'),
            ),
          },
          where: await handle.$eval(
            'xpath/td/a[starts-with(@href, "/lists/m_act")]/following-sibling::small',
            (node) => node.textContent.trim(),
          ),
          views: await handle.$eval(
            'xpath/td/a[starts-with(@href, "/lists/m_act")]/parent::td/following-sibling::td/small',
            (node) => node.textContent.trim(),
          ),
        })),
      ),
    );

    console.log('Спарсил views');
    return views;
  }
}
