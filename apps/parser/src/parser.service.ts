import puppeteer, { Page } from 'puppeteer';
import {
  actorsXpath,
  composersXpath,
  designersXpath,
  directorsXpath,
  editorsXpath,
  operatorsXpath,
  producersXpath,
  translatorsXpath,
  voiceDirectorsXpath,
  voicesXpath,
  writersXpath,
} from './xpath/role';
import {
  countryXpath,
  genreXpath,
  origTitleXpath,
  premierXpath,
  sloganXpath,
  timeXpath,
  titleXpath,
} from './xpath/main-page';
import { previewElement, previewFrame, previewPageXPath } from './xpath/trailer';
import { Injectable } from '@nestjs/common';
import { ParsedActorDTO, ParsedFilmDTO } from '@app/shared';
import { CreateCountryDTO } from '@app/shared/dto/create-country.dto';
import { ResponseDTO } from '@app/rabbit';
import {
  MPAA_Link,
  minAgeXpath,
  restrictionAbbrivaitaionXpath,
  restrictionFullDescriptionXpath,
  restrictionShortDescriptionXpath,
} from './xpath/age-restriction';
import { CreateAgeRestrictionDTO } from '@app/shared/dto/create-age-restriction.dto';
import { ActorParserService } from './actor.parser/actor.parser.service';
import { ReviewParserService } from './review.parser/review.parser.service';


const DOMEN = 'https://www.kinopoisk.ru';
@Injectable()
export class ParserService {
  constructor(
    private readonly actorParserService: ActorParserService,
    private readonly reviewParserService: ReviewParserService,
  ) {}

  async parse(film: number): Promise<ResponseDTO<ParsedFilmDTO>> {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await this.optimizePageLoad(page);

    try {
      console.log('Inside try-catch');
      const mainPageInfo = await this.parseMainPage(page, film);
      console.log('Спарсил main page');
      const preview = await this.getPreview(page, film);
      console.log('Спарсил preview url');
      const views = await this.parseViews(page, film);
      console.log('Спарсил views');
      const persons = await this.actorParserService.parsePersons(page, film);
      console.log('Спарсил persons');
      const comments = await this.reviewParserService.parseComments(page, film);
      console.log('Спарсил комменты');

      const res = { ...mainPageInfo, persons, views, comments };
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
        blockedTypes.includes(resourceType)
        // || blockResourceName.some((resource) => requestUrl.includes(resource))
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  private async parseMainPage(page: Page, film: number) {
    const mainUrl = `${DOMEN}/film/${film}/`;
    console.log(`navigatre to :${mainUrl}`)

    await page.goto(mainUrl, {
      waitUntil: 'networkidle0',
    });

    const originalTitle = await page
      .waitForXPath(origTitleXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    const { title, year } = await page
      .waitForXPath(titleXpath)
      .then((handle) =>
        handle.evaluate(
          (node) =>
            node.textContent.match(/(?<title>.*) \((?<year>\d{4})\)/).groups,
        ),
      );

    const country: CreateCountryDTO = await page
      .waitForXPath(countryXpath)
      .then((handle) =>
        handle.evaluate((node: HTMLAnchorElement) => ({
          countryName: node.textContent,
          url: node.getAttribute('href'),
        })),
      );

    const slogan = await page
      .waitForXPath(sloganXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    const genres = await Promise.all(
      await page
        .$x(genreXpath)
        .then((handles) =>
          handles.map((handle) =>
            handle.evaluate((node) => ({ genreName: node.textContent })),
          ),
        ),
    );

    const duration = await (
      await page.waitForXPath(timeXpath)
    ).evaluate((node) => node.textContent);

    const ageRestriction = await this.parseAgeRestrictions(page);
    // console.log('Спарсил ageRestrictions');
    const res = {
      url: mainUrl,
      title,
      originalTitle,
      year: parseInt(year),
      genres,
      country,
      slogan,
      duration: this.extractTime(duration),
      ageRestriction,
    };

    return res;
  }

  private async parseAgeRestrictions(
    page: Page,
  ): Promise<CreateAgeRestrictionDTO> {
    console.log('Parsing age restrictions:')
    const minAge = await page
      .waitForXPath(minAgeXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const abbreviation = await page
      .waitForXPath(restrictionAbbrivaitaionXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const shortDescription = await page
      .waitForXPath(restrictionShortDescriptionXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const url = await page
      .$(`xpath/${MPAA_Link}`)
      .then((handle) => handle.evaluate((node) => node.getAttribute('href')));
    
    console.log(`go to url: ${DOMEN}${url}`);
    await page.goto(`${DOMEN}${url}`, {
      waitUntil: 'networkidle0',
    });
    const longDescription = await page
      .waitForXPath(restrictionFullDescriptionXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    return {
      url: `${DOMEN}/${url}`,
      minAge: minAge,
      abbreviation,
      shortDescription,
      longDescription,
    };
  }

  private async getPreview(page: Page, film: number) {
    const url = await page.$(`xpath/${previewPageXPath(film)}`).then((handle) => handle.evaluate((node) => node.getAttribute('href')));
    console.log(`Navigating to ${DOMEN}${url}`);
    await page.goto(`${DOMEN}${url}`, {
      waitUntil: 'networkidle0',
    });

    await page.click(`xpath/${previewElement}`);
    const src = await page
      .$(`xpath/${previewFrame(film)}`)
      .then((handle) => handle.evaluate((el) => el.getAttribute('src')));
    return src;
  }

  private extractTime(time: string) {
    let minutes: string;
    if (time.includes('/')) {
      minutes = time.trim().split(/ *\/ */)[1];
    } else if (/\d* мин\./.test(time)) {
      minutes = /(?<minutes>\d*) мин\./.exec(time).groups['minutes'];
    } else {
      throw new Error(
        `Кажется ты не предусмотрел как прасить время в формате ${time}`,
      );
    }
    return `${minutes} minutes`;
  }

  private async parseViews(page: Page, film: number) {
    const datesUrl = `${DOMEN}/film/${film}/dates/`;

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

    return views;
  }

}
