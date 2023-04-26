import { Injectable } from '@nestjs/common';
import { DOMEN } from '../constants';
import { ElementHandle, Page } from 'puppeteer';
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
} from '../xpath/role';
import { ParsedActorDTO } from '@app/shared';

@Injectable()
export class ActorParserService {
  async parsePersons(page: Page, film: number) {
    const actorsUrl = `${DOMEN}/film/${film}/cast`;
    console.log(`Пытаюсь спарсить команду фильма - navigate to ${actorsUrl}`);

    try {
      await page.goto(actorsUrl, {
        waitUntil: 'networkidle0',
      });

      const directors = await this.parsePersonsWithRole(page, directorsXpath);
      const actors = await this.parsePersonsWithRole(page, actorsXpath, true);
      const producers = await this.parsePersonsWithRole(page, producersXpath);
      const voiceDirectors = await this.parsePersonsWithRole(
        page,
        voiceDirectorsXpath,
      );
      const translators = await this.parsePersonsWithRole(
        page,
        translatorsXpath,
      );
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
      console.log(`Успешно спарсил команду фильма ${film}`);
      return res;
    } catch {
      console.log(`Не удалось спарсить команду фильма ${film}`);
    }
  }

  private fullUrl(url: string) {
    return DOMEN + url;
  }

  async parsePersonsWithRole(
    page: Page,
    xpath: string,
    isActor = false,
  ): Promise<ParsedActorDTO[]> {
    const personHandle: ElementHandle<Node> = (await page.$x(xpath))[0];
    const persons = await page.$x(xpath).then((handles) =>
      handles.map(async (personHandle) => {
        const { url, fullName } = await personHandle.$eval(
          'div.info > div.name>a',
          (node) => ({
            url: node.getAttribute('href'),
            fullName: node.text,
          }),
        );
        const fullNameEn = await personHandle.$eval(
          'div.info > div.name>span',
          (node) => node.textContent,
        );
        const photo = await personHandle.$eval('div.photo>a>img', (node) =>
          node.getAttribute('src'),
        );
        const role = await personHandle.$eval(
          'div.info>div.role',
          (node) => node.innerText,
        );

        const res = {
          url: this.fullUrl(url),
          fullName,
          fullNameEn,
          photo: this.fullUrl(photo),
          role,
          dub: isActor ? await this.getDublers(personHandle, role) : undefined,
        };
        return res;
      }),
    );

    return Promise.all(persons);
  }

  async getDublers(
    personHandle: ElementHandle<Node>,
    role: string,
  ): Promise<ParsedActorDTO[]> {
    try {
      // не у всех актеров есть дублер => возможно исключение. Решение конечно костыльненькое

      const dublers = await personHandle
        .$x(
          'following-sibling::div[@class="dubInfo"]//div[contains(@class, "photo")]',
        )
        .then((handles) =>
          handles.map(async (handle) => {
            const url = await handle.$eval('a', (el) =>
              el.getAttribute('href'),
            );
            const { fullName, photo } = await handle.$eval('a>img', (el) => ({
              fullName: el.getAttribute('alt'),
              photo: el.getAttribute('src'),
            }));

            return {
              url: this.fullUrl(url),
              fullName,
              role,
              photo: this.fullUrl(photo),
            };
          }),
        );

      return Promise.all(dublers);
    } catch (e) {
      console.log('Не удалось спасить дублепа');
      console.log(e);
      return;
    }
  }
}
