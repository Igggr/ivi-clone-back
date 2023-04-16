import { Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';


const titleXpath = '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[1]/div[1]/div/div[1]/h1/span';
const genreXpath = '//a[contains(@href, "lists/movies/genre--")]';
const timeXpath = '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[23]/div[2]/div';


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
    const mainUrl = `https://www.kinopoisk.ru/film/${film}/`;
    const actorsUrl = `https://www.kinopoisk.ru/film/${film}/cast`;
    const voicesUrl = `https://www.kinopoisk.ru/film/${film}/cast/who_is/voice/`;

    console.log(mainUrl);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(mainUrl, {
      waitUntil: 'domcontentloaded',
    });

    try {

      const { title, year} = await (
        await page.waitForXPath(titleXpath)
      ).evaluate((node) => node.textContent.match(/(?<title>.*) \((?<year>\d{4})\)/).groups);
      
      console.log(title);
      console.log(year);

      const genres = await Promise.all(
        await (
          await page.$x(genreXpath)
        ).map((handle) => handle.evaluate(
          (n) => n.textContent
        )))
        ;
     
      console.log(genres);

      const duration = await (
        await page.waitForXPath(timeXpath)
      ).evaluate((node) => node.textContent);

      console.log(duration);

      await page.goto(actorsUrl, {
        waitUntil: 'domcontentloaded'
      });

      const persons = await this.getPersons(page);

      // page.goto(voicesUrl);
      
      const res = { title, year, genres, duration, persons };
      console.log(res);
      return res;
    } catch (e) {
      console.log(e)
    }
    finally {
      await page.close();
      await browser.close();
    }
  }

  async getPersons(page: Page) {
    const directors = await this.getPersonsWithRole(page, directorsXpath);
    console.log('direcors:\n\n')
    console.log(directors);
    const actors = await this.getPersonsWithRole(page, actorsXpath);
    console.log('actors:\n\n')
    console.log(actors);
    const producers = await this.getPersonsWithRole(page, producersXpath);
    const voiceDirectors = await this.getPersonsWithRole(page, voiceDirectorsXpath);
    const translators = await this.getPersonsWithRole(page, translatorsXpath);
    const voices = await this.getPersonsWithRole(page, voicesXpath);
    const writers = await this.getPersonsWithRole(page, writersXpath);
    const operators = await this.getPersonsWithRole(page, operatorsXpath);
    const composers = await this.getPersonsWithRole(page, composersXpath);
    const designers = await this.getPersonsWithRole(page, designersXpath);
    const editors = await this.getPersonsWithRole(page, editorsXpath);

    return { directors, actors, producers, voiceDirectors, translators, voices, writers, operators, composers, designers, editors };
  }

  private async getPersonsWithRole(page: Page, xpath: string) {

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
           console.log(res);
          return res;
        })
    );

    return persons;
  }


}
