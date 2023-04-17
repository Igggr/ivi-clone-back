import { Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';


const titleXpath = '//div[starts-with(@class, "styles_title")]/h1[starts-with(@class, "styles_title")]/span';
const origTitleXpath = '//span[starts-with(@class, "styles_originalTitle")]';
const genreXpath = '//a[starts-with(@href, "/lists/movies/genre--")]';
const countryXpath = '//a[starts-with(@href, "/lists/movies/country")]';
const sloganXpath = '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[4]/div[2]/div/text()';
const timeXpath = '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[23]/div[2]/div';

// часть td - просто разделители. Этот спуск, а потом подъем в родимтеля нужен для фильтарция
const premierXpath = '//*[@id="block_left"]/div/table/tbody/tr[2]/td/table/tbody/tr/td/a/parent::td/parent::tr'


type Role = 'director' | 'actor' | 'producer' | 'voice_director' | 'translator' | 'voice' | 'writer'
  | 'operator' | 'composer' | 'design' | 'editor';

const directorsXpath = xpathBeetweenRoles('director', 'actor');
const actorsXpath = xpathBeetweenRoles('actor', 'producer');
const producersXpath = xpathBeetweenRoles('producer', 'voice_director');
const voiceDirectorsXpath = xpathBeetweenRoles('voice_director', 'translator');
const translatorsXpath = xpathBeetweenRoles('translator', 'voice');
const voicesXpath = xpathBeetweenRoles('voice', 'writer');
const writersXpath = xpathBeetweenRoles('writer', 'operator');
const operatorsXpath = xpathBeetweenRoles('operator', 'composer');
const composersXpath = xpathBeetweenRoles('composer', 'design');
const designersXpath = xpathBeetweenRoles('design', 'editor');
const editorsXpath = '//a[@name="editor"]/following-sibling::div//div[@class="actorInfo"]';


function xpathBetween(tagBefore: string, tagAfter: string): string {
  return `[preceding-sibling::${tagBefore} and not(preceding-sibling::${tagAfter})]`;
}

function xpathBeetweenRoles(roleFrom: Role, roleTo: Role) {
  const tagBefore = `a[@name="${roleFrom}"]`;
  const tagAfter = `a[@name="${roleTo}"]`;

  return `//div${xpathBetween(tagBefore, tagAfter)}//div[@class="actorInfo"]`;
}


@Injectable()
export class ParserService {

  async parse(film: number = 535341) {   

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await this.optimizePageLoad(page);

    try {

      const mainPageInfo = await this.parseMainPage(page, film);
      const views = await this.parseViews(page, film);
      const persons = await this.parsePersons(page, film);

      const res = { ...mainPageInfo, persons, views };
      console.log(res);
      return { status: 'ok', value: res };
    } catch (e) {
      console.log(e)
      return { status: 'error', error: e };
    }
    finally {
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
      if (blockedTypes.includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    })
  }

  private async parseMainPage(page: Page, film: number) {
    const mainUrl = `https://www.kinopoisk.ru/film/${film}/`;

    await page.goto(mainUrl, {
      waitUntil: 'domcontentloaded',
    });

    const originalTitle = await page.waitForXPath(origTitleXpath)
      .then((handle) => handle.evaluate((node) => node.textContent))

    const { title, year } = await page.waitForXPath(titleXpath)
      .then((handle) => handle.evaluate((node) => node.textContent.match(/(?<title>.*) \((?<year>\d{4})\)/).groups));

    const country = await page.waitForXPath(countryXpath)
      .then((handle) => handle.evaluate((node: HTMLAnchorElement) => ({ country: node.textContent, countryLink: node.getAttribute('href') })));

    const slogan = await page.waitForXPath(sloganXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));


    const genres = await Promise.all(
      await page.$x(genreXpath).then(
        (handles) => handles.map((handle) => handle.evaluate((node) => node.textContent))
      )
    );

    const duration = await (
      await page.waitForXPath(timeXpath)
    ).evaluate((node) => node.textContent);

    const res = { title, originalTitle, year, genres, country, slogan, duration };
    
    return res;
  }

  private async parseViews(page: Page, film: number) {
    const datesUrl = `https://www.kinopoisk.ru/film/${film}/dates/`;

    await page.goto(datesUrl, {
      waitUntil: 'networkidle0',
    });

    const views = await Promise.all(await page.$x(premierXpath).then(
      (handles) => handles.map(async (handle) => ({
        date: await handle.$eval('td>span>b', (node) => node.textContent),
        country: {
          country: await handle.$eval('td>a', (node) => node.textContent),
          countryLink: await handle.$eval('xpath/td/a[starts-with(@href, "/lists/m_act")]', (node) => node.getAttribute('href')),
        },
        where: await handle.$eval('xpath/td/a[starts-with(@href, "/lists/m_act")]/following-sibling::small', (node) => node.textContent.trim()),
        views: await handle.$eval('xpath/td/a[starts-with(@href, "/lists/m_act")]/parent::td/following-sibling::td/small', (node) => node.textContent.trim()),
      }))
    ))

    console.log('Views:\n\n')
    console.log(views);
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
    const voiceDirectors = await this.parsePersonsWithRole(page, voiceDirectorsXpath);
    const translators = await this.parsePersonsWithRole(page, translatorsXpath);
    const voices = await this.parsePersonsWithRole(page, voicesXpath);
    const writers = await this.parsePersonsWithRole(page, writersXpath);
    const operators = await this.parsePersonsWithRole(page, operatorsXpath);
    const composers = await this.parsePersonsWithRole(page, composersXpath);
    const designers = await this.parsePersonsWithRole(page, designersXpath);
    const editors = await this.parsePersonsWithRole(page, editorsXpath);

    const res = { directors, actors, producers, voiceDirectors, translators, voices, writers, operators, composers, designers, editors };
    return res;
  }

  private async parsePersonsWithRole(page: Page, xpath: string) {

    const persons = await Promise.all(
      (await page.$x(xpath))
        .map(async (d) => {
          const nameHandler = await d.$('div.info>div.name');

          const { url, name } = await nameHandler.$('a').then((handle) => handle.evaluate((node) => ({ url: node.getAttribute('href'), name: node.text })));
          // console.log({ url, name });
          const name_en = await nameHandler.$('span').then((handle) => handle.evaluate((node) => node.textContent));
          // console.log(name_en);
          // const photo = await d.$('div.photo>a>img').then((handle) => handle.evaluate((node) => node.getAttribute('src')));

          const res = {
            url,
            name,
            name_en,
            // photo,
          };
          //  console.log(res);
          return res;
        })
    );

    return persons;
  }


}
