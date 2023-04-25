import { Injectable } from '@nestjs/common';
import { DOMEN } from '../constants';
import { Page } from 'puppeteer';
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

    console.log('Паршу команду фильмаб navigate to ${actorsUrl}');

    try {
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
      console.log('Учпешно спарисл команду фильма');
      return res;
    } catch {
      console.log('Не удалось спарсить команду фильма')
    }
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
}
