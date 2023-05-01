import { Injectable } from '@nestjs/common';
import { DOMEN, fullUrl } from '../constants';
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
import { CreateAgeRestrictionDTO, CreateGenreDTO } from '@app/shared';

@Injectable()
export class MainPageParserService {
  async parseMainPage(page: Page, film: number) {
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
      )
      .then(({ countryName, url }) => ({ countryName, url: fullUrl(url) }));

    const slogan = await page
      .waitForXPath(sloganXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));

    const genres = await this.getGenres(page);
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
      ageRestriction,
    };

    return res;
  }

  private async getGenres(page: Page): Promise<CreateGenreDTO[]> {
    const regexp = /\/lists\/movies\/genre--(?<genreNameEn>[A-Za-z]+)\//
    const genres = await Promise.all(
      await page
        .$x(genreXpath)
        .then((handles) =>
          handles.map((handle) =>
            handle.$eval('a', (el) => ({
              genreName: el.textContent,
              href: el.getAttribute('href'),
            })
            )
          ),
      )
    )
    return genres.map(({href, genreName}) => ({genreName, url: fullUrl(href), genreNameEn: regexp.exec(href).groups.genreNameEn }));
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
    const description = await page
      .waitForXPath(restrictionShortDescriptionXpath)
      .then((handle) => handle.evaluate((node) => node.textContent));
    const url = await page
      .$(`xpath/${MPAA_Link}`)
      .then((handle) => handle.evaluate((node) => node.getAttribute('href')));

    return {
      url: `${DOMEN}/${url}`,
      minAge: minAge,
      abbreviation,
      description,
    };
  }

  private extractTime(time: string) {
    let minutes: string;
    if (/\d* мин\./.test(time)) {
      minutes = /(?<minutes>\d*) мин\./.exec(time).groups['minutes'];
    } else {
      throw new Error(
        `Кажется ты не предусмотрел как парсить время в формате ${time}`,
      );
    }
    return `${minutes} minutes`;
  }
}
