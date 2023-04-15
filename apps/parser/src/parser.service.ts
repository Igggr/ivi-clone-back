import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';


const titleXpath = '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[1]/div[1]/div/div[1]/h1/span';
const genreXpath = '//a[contains(@href, "lists/movies/genre--")]';
const timeXpath = '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[23]/div[2]/div';

const directorTag = `a[@name="director"]`;
const actorTag = 'a[@name="actor"]';
const producerTag = 'a[@name="producer"]';
const voiceDirectorTag = 'a[@name="voice_director"]';
const translatorTag = 'a[@name="translator"]';
const voiceTag = 'a[@name="voice"]';
const writerTag = 'a[@anm="writer"]';
const operatorTag = 'a[@name="operator"]';
const composerTag = 'a[@name="composer"]';
const designTag = 'a[@name="design"]';
const editorTag = 'a[@name="deitor"]';

function foo(n) {
  console.log(n);
  
}

@Injectable()
export class ParserService {

  private xpathBetween(tagBefore, tagAfter): string {
    return `[preceding-sibling::${tagBefore} and not(preceding-sibling::${tagAfter})]`;
  }

  private actorInfo(tagBefore, tagAfter) {
    return `//div${this.xpathBetween(tagBefore, tagAfter)}//div[@class="actorInfo"]`;
  }

  get directorXpath() {
    return this.actorInfo(directorTag, actorTag);
  }

  get actorXpath() {
    return this.actorInfo(actorTag, producerTag);
  }

  get proudcerXpath() {
    return this.actorInfo(producerTag, voiceDirectorTag); 
  }

  get voiceDirectorXpath() {
    return this.actorInfo(voiceDirectorTag, translatorTag);
  }

  get translatorXpath() {
    return this.actorInfo(translatorTag, voiceTag);
  }

  get voiceXpath() {
    return this.actorInfo(voiceTag, writerTag);
  }

  get writerXpath() {
    return this.actorInfo(writerTag, operatorTag);
  }

  get operatorXpath() {
    return this.actorInfo(operatorTag, composerTag);
  }

  get composerXpath() {
    return this.actorInfo(composerTag, designTag);
  }

  get designXpath() {
    return this.actorInfo(designTag, editorTag);
  }

  get editorXpath() {
    return `${editorTag}//following-sibling::div//div[@clas="actorInfo]`
  }
  



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

      const fullTitle = await (
        await page.waitForXPath(titleXpath)
      ).evaluate((node) => node.textContent);
      
      console.log(fullTitle);

      const genres = await Promise.all(
        await (
          await page.$x(genreXpath)
        ).map((handle) => handle.evaluate(
          (n) => n.textContent
        )))
        ;
     
      console.log(genres);

      const time = await (
        await page.waitForXPath(timeXpath)
      ).evaluate((node) => node.textContent);

      console.log(time);

      await page.goto(actorsUrl);

      console.log(`$x('${this.directorXpath}')`);
      console.log(`$x(${this.actorXpath}')`)

      const directors = await page.$x(this.directorXpath);

      console.log(directors);

      const actor = await page.$x(this.actorXpath);
      console.log(actor);

      const producers = await page.$x(this.proudcerXpath);
      const voiceDirectors = await page.$x(this.voiceDirectorXpath);
      const translatrors = await page.$x(this.translatorXpath);
      const voices = await page.$x(this.voiceXpath);
      const writers = await page.$x(this.writerXpath);
      const operators = await page.$x(this.operatorXpath);
      const composers = await page.$x(this.composerXpath);
      const designers = await page.$x(this.designXpath);
      const editors = await page.$x(this.editorXpath);

      // page.goto(voicesUrl);

    } catch (e) {
      console.log(e)
    }
    finally {
      await page.close();
      await browser.close();
    }
  }
}
