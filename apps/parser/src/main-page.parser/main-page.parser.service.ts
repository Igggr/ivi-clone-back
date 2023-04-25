import { Injectable } from '@nestjs/common';
import { DOMEN } from '../constants';
import { Page } from 'puppeteer';
import {
  countryXpath,
  genreXpath,
  origTitleXpath,
  sloganXpath,
  timeXpath,
  titleXpath,
} from '../xpath/main-page';
import {
  MPAA_Link,
  minAgeXpath,
  restrictionAbbrivaitaionXpath,
  restrictionShortDescriptionXpath,
} from '../xpath/age-restriction';
import { CreateCountryDTO } from '@app/shared/dto/create-country.dto';
import { CreateAgeRestrictionDTO } from '@app/shared';

@Injectable()
export class MainPageParserService {
  async parseMainPage(page: Page, film: number) {
    const mainUrl = `${DOMEN}/film/${film}/`;
    console.log(`Начал парсить main page - navigatre to :${mainUrl}`);

    await page.goto(mainUrl, {
      waitUntil: 'networkidle0',
    });

    const originalTitle = await page
      .waitForXPath(origTitleXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    console.log(`Получил originalTitle ${originalTitle}`);
    const { title, year } = await page
      .waitForXPath(titleXpath)
      .then((handle) =>
        handle.evaluate(
          (node) =>
            node.textContent.match(/(?<title>.*) \((?<year>\d{4})\)/).groups,
        ),
      );

    console.log(`Get title: ${title} and year: ${year}`);

    const country: CreateCountryDTO = await page
      .waitForXPath(countryXpath)
      .then((handle) =>
        handle.evaluate((node: HTMLAnchorElement) => ({
          countryName: node.textContent,
          url: node.getAttribute('href'),
        })),
      );

    console.log(`Get country ${country}`);

    const slogan = await page
      .waitForXPath(sloganXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    console.log(`Get slogan: ${slogan}`);
    const genres = await Promise.all(
      await page
        .$x(genreXpath)
        .then((handles) =>
          handles.map((handle) =>
            handle.evaluate((node) => ({ genreName: node.textContent })),
          ),
        ),
    );

    console.log(`Get genres ${genres}`);

    const duration = await (
      await page.waitForXPath(timeXpath)
    ).evaluate((node) => node.textContent);

    console.log(`Get duration: ${duration}`);
    const ageRestriction = await this.parseAgeRestrictions(page);
    console.log(`Get ageRestrictions: ${ageRestriction}`);
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
    console.log(`Закончил парсить main page for film ${film}`);

    return res;
  }

  private async parseAgeRestrictions(
    page: Page,
  ): Promise<CreateAgeRestrictionDTO> {
    console.log('Parsing age restrictions:');
    const minAge = await page
      .waitForXPath(minAgeXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const abbreviation = await page
      .waitForXPath(restrictionAbbrivaitaionXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const description = await page
      .waitForXPath(restrictionShortDescriptionXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const url = await page
      .$(`xpath/${MPAA_Link}`)
      .then((handle) => handle.evaluate((node) => node.getAttribute('href')));

    console.log('Закончил парсить age restrictions');
    return {
      url: `${DOMEN}/${url}`,
      minAge: minAge,
      abbreviation,
      description,
    };
  }

  private extractTime(time: string) {
    let minutes: string;
    if (time.includes('/')) {
      minutes = time.trim().split(/ *\/ */)[1];
    } else if (/\d* мин\./.test(time)) {
      minutes = /(?<minutes>\d*) мин\./.exec(time).groups['minutes'];
    } else {
      throw new Error(
        `Кажется ты не предусмотрел как парсить время в формате ${time}`,
      );
    }
    return `${minutes} minutes`;
  }
}
