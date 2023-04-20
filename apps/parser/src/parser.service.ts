import puppeteer, { Page } from 'puppeteer';
import {
  actorsXpath,
  composersXpath,
  countryXpath,
  designersXpath,
  directorsXpath,
  editorsXpath,
  genreXpath,
  operatorsXpath,
  origTitleXpath,
  premierXpath,
  producersXpath,
  sloganXpath,
  timeXpath,
  titleXpath,
  translatorsXpath,
  voiceDirectorsXpath,
  voicesXpath,
  writersXpath,
} from './xpath';
import { Injectable } from '@nestjs/common';
import { ParsedActorDTO } from '@app/shared';

@Injectable()
export class ParserService {
  async parse(film: number) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await this.optimizePageLoad(page);

    try {
      console.log('Inside try-catch');
      const mainPageInfo = await this.parseMainPage(page, film);
      console.log('Спарсил main page');
      const views = await this.parseViews(page, film);
      console.log('Спарисл views');
      const persons = await this.parsePersons(page, film);
      console.log('Спарисл persons');
      const comments = await this.parseComments(page, film);
      console.log('Спарисл комменты')

      const res = { ...mainPageInfo, persons, views, comments };
      return { status: 'ok', value: res };
    } catch (e) {
      return { status: 'error', error: e };
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
    const mainUrl = `https://www.kinopoisk.ru/film/${film}/`;

    await page.goto(mainUrl, {
      waitUntil: 'domcontentloaded',
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

    const country = await page.waitForXPath(countryXpath).then((handle) =>
      handle.evaluate((node: HTMLAnchorElement) => ({
        country: node.textContent,
        countryLink: node.getAttribute('href'),
      })),
    );

    const slogan = await page
      .waitForXPath(sloganXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    const genres = await Promise.all(
      await page
        .$x(genreXpath)
        .then((handles) =>
          handles.map((handle) => handle.evaluate((node) => node.textContent)),
        ),
    );

    const duration = await (
      await page.waitForXPath(timeXpath)
    ).evaluate((node) => node.textContent);

    const res = {
      title,
      originalTitle,
      year,
      genres,
      country,
      slogan,
      duration,
    };

    return res;
  }

  private async parseViews(page: Page, film: number) {
    const datesUrl = `https://www.kinopoisk.ru/film/${film}/dates/`;

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
    const actorsUrl = `https://www.kinopoisk.ru/film/${film}/cast`;

    await page.goto(actorsUrl, {
      waitUntil: 'domcontentloaded',
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
      directors,
      actors,
      producers,
      voiceDirectors,
      translators,
      voices,
      writers,
      operators,
      composers,
      designers,
      editors,
    };
    return res;
  }

  private async parsePersonsWithRole(page: Page, xpath: string): Promise<ParsedActorDTO[]> {
    const persons = await Promise.all(
      (
        await page.$x(xpath)
      ).map(async (personHandle) => {
        const nameHandler = await personHandle.$('div.info>div.name');

        const { url, fullName } = await nameHandler.$eval('a', (node) => ({
          url: node.getAttribute('href'),
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
              url: node.getAttribute('href'),
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
    const reviewsPage = `https://www.kinopoisk.ru/film/${film}/reviews/?ord=rating`;
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
