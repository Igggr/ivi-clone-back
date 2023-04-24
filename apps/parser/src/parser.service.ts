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
import { previewElement, previewFrame, previewPageUrl } from './xpath/trailer';
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

// взял из таблички с бесплатными прокси-серверами с карйне стремного сайта
// http://free-proxy.cz/ru/proxylist/main/3
const PROXY = '95.216.170.84';
const PORT = '8080';

const DOMEN = 'https://www.kinopoisk.ru';
@Injectable()
export class ParserService {
  async parse(film: number): Promise<ResponseDTO<ParsedFilmDTO>> {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      // args: [`--proxy-server=${PROXY}:${PORT}`],
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
      const persons = await this.parsePersons(page, film);
      console.log('Спарсил persons');
      const comments = await this.parseComments(page, film);
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
        blockedTypes.includes(resourceType) ||
        blockResourceName.some((resource) => requestUrl.includes(resource))
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  private async parseMainPage(page: Page, film: number) {
    const mainUrl = `${DOMEN}/film/${film}/`;

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
    const res = {
      url: mainUrl,
      title,
      originalTitle,
      year: parseInt(year),
      genres,
      country,
      slogan,
      duration: this.extractTime(duration),
      restriction: ageRestriction,
    };

    return res;
  }

  private async parseAgeRestrictions(
    page: Page,
  ): Promise<CreateAgeRestrictionDTO> {
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
    await page.goto(url, {
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
    await page.goto(previewPageUrl(film), {
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

  private async parsePersons(page: Page, film: number) {
    const actorsUrl = `${DOMEN}/film/${film}/cast`;

    await page.goto(actorsUrl, {
      waitUntil: 'networkidle0',
    });

    const directors = await this.parsePersonsWithRole(page, directorsXpath);
    const actors = await this.parsePersonsWithRole(page, actorsXpath);
    const producers = await this.parsePersonsWithRole(page, producersXpath);
    const voiceDirectors = await this.parsePersonsWithRole(
      page,
      voiceDirectorsXpath,
    );
    const translators = await this.parsePersonsWithRole(page, translatorsXpath);
    const voices = await this.parsePersonsWithRole(page, voicesXpath);
    const writers = await this.parsePersonsWithRole(page, writersXpath);
    const operators = await this.parsePersonsWithRole(page, operatorsXpath);
    const composers = await this.parsePersonsWithRole(page, composersXpath);
    const designers = await this.parsePersonsWithRole(page, designersXpath);
    const editors = await this.parsePersonsWithRole(page, editorsXpath);

    const res = {
      director: directors,
      actor: actors,
      producer: producers,
      voiceDirector: voiceDirectors,
      translator: translators,
      voice: voices,
      writer: writers,
      operator: operators,
      composer: composers,
      designer: designers,
      editor: editors,
    };
    return res;
  }

  private async parsePersonsWithRole(
    page: Page,
    xpath: string,
  ): Promise<ParsedActorDTO[]> {
    const persons = await Promise.all(
      (
        await page.$x(xpath)
      ).map(async (personHandle) => {
        const nameHandler = await personHandle.$('div.info>div.name');

        const { url, fullName } = await nameHandler.$eval('a', (node) => ({
          url: DOMEN + '/' + node.getAttribute('href'),
          fullName: node.text,
        }));
        const fullName_en = await nameHandler.$eval(
          'span',
          (node) => node.textContent,
        );

        // в src почему-то какой-то мусор. Хотя в коже страницы все нормально. Пришлось брать из атрибута title
        // (в коде старницы он совпадает c src, но здесь коректен только title)
        const photo = await personHandle.$eval('div.photo>a>img', (node) =>
          node.getAttribute('title'),
        );
        const role = await personHandle.$eval(
          'div.info>div.role',
          (node) => node.textContent,
        );

        let dub;
        try {
          // этот элемент есть не везде (не у всех актеров есть дублер) => исключение. Решение конечно костыльненькое
          dub = await personHandle.$eval(
            'xpath/following-sibling::div[@class="dubInfo"]/div[@class="name"]/a',
            (node) => ({
              // TODO: привести в оответсвие с CreateActorDTO
              who: node.textContent,
              url: `${DOMEN}/${node.getAttribute('href')}`,
            }),
          );
        } catch (e) {}
        const res = {
          url,
          fullName,
          fullName_en,
          photo,
          role,
          dub,
        };
        return res;
      }),
    );

    return persons;
  }

  private async parseComments(page: Page, film: number) {
    // по идее так я только первую страницу паршу - то есть надо дорабатывать
    const reviewsPage = `${DOMEN}/film/${film}/reviews/?ord=rating`;
    await page.goto(reviewsPage, {
      waitUntil: 'networkidle0',
    });

    const reviewHandels = await page.$x(
      '//div[contains(@class, "userReview")]/div[contains(@class, "response")]',
    );

    const reviews = await Promise.all(
      reviewHandels.map(async (handle) => {
        const res = {
          title: await handle.$eval('meta', (node) =>
            node.getAttribute('content'),
          ),

          // кто же хранит ответ пользователя в таблице ???
          text: await handle.$eval('table', (node) => node.textContent.trim()),
          // user: await handle.$eval('/xpath/div[@itemprop="author"]/div/p[@class="profile_name"]/a[@itemprop="name"]', (node) => ({
          //   userName: node.textContent,
          //   url: node.getAttribute('href'),
          // }))
        };
        console.log(res);
        return res;
      }),
    );

    return reviews;
  }
}
