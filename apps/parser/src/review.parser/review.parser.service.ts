import { Injectable } from '@nestjs/common';
import { ElementHandle, Page } from 'puppeteer';
import { DOMEN, fullUrl, replaceNbsp } from '../constants';
import {
  commentXpath,
  nextPageXpath,
  reviewBodyXpath,
  reviewPageXpath,
  reviewTitleXpath,
  reviewerXpath,
} from '../xpath/reviews';
import {
  ParsedCommentDTO,
  ParsedProfileDTO,
  ParsedReviewDTO,
} from '@app/shared';

@Injectable()
export class ReviewParserService {
  async parseReviews(page: Page, film: number) {
    const reviews = [];

    const links = await this.getAllReviewLinks(page, film);
    for (const link of links) {
      // ага, ПОСЛЕДОВАТЕЛЬНО - иначе будут перетирать page
      // Возможно можно сделать неколько page?
      reviews.push(await this.parseOneReview(page, link));
    }
    return reviews;
  }

  async getReviewLinksForOnePage(page: Page): Promise<string[]> {
    const links = await page
      .$x(reviewPageXpath)
      .then((handles) =>
        handles.map((handle) =>
          handle.$eval('a', (el) => el.getAttribute('href')),
        ),
      );

    return (await Promise.all(links)).map((link) => fullUrl(link));
  }

  async getAllReviewLinks(page: Page, film: number) {
    let reviewsUrl = `${DOMEN}/film/${film}/reviews/ord/date/status/all/perpage/10/page/1/`;
    const links = [];
    try {
      while (true) {
        await page.goto(reviewsUrl, {
          waitUntil: 'networkidle0',
        });
        links.push(...(await this.getReviewLinksForOnePage(page)));
        reviewsUrl = fullUrl(
          await page
            .waitForXPath(nextPageXpath)
            .then((h) => h.$eval('a', (el) => el.getAttribute('href'))),
        );
      }
    } catch (e) {
      // когда ссылки на новую страницу не будет произойдет исключение ==> все ссылки уже были получены
      return links;
    }
  }

  async parseOneReview(page: Page, url: string): Promise<ParsedReviewDTO> {
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    const title = await page.$eval(
      `xpath/${reviewTitleXpath}`,
      (el) => el.textContent,
    );
    const text = await page.$eval(
      `xpath/${reviewBodyXpath}`,
      (el) => el.innerHTML,
    );
    const { name, userUrl } = await page.$eval(
      `xpath/${reviewerXpath}`,
      (el) => ({ name: el.textContent, userUrl: el.getAttribute('href') }),
    );

    const photo = await page.$eval(
      `xpath/${reviewerXpath}/parent::p/parent::div/parent::td/parent::tr/parent::tbody/tr/td/img`,
      (el) => el.getAttribute('src'),
    );

    return {
      url,
      title,
      text,
      profile: {
        nickname: name,
        url: fullUrl(userUrl),
        photo: fullUrl(photo),
      },
      comments: await this.parseComments(page),
    };
  }

  async parseComments(page: Page): Promise<ParsedCommentDTO[]> {
    const handles = await page.$x(commentXpath);
    const comments: Promise<ParsedCommentDTO>[] = handles.map(
      async (handle) => ({
        url: fullUrl(
          await handle.$eval('div.toppy>a.anchor', (el) =>
            el.getAttribute('href'),
          ),
        ),
        text: replaceNbsp(await handle.$eval('p.text', (el) => el.textContent)),
        commentId: await this.getCommentId(handle),
        parentId: await this.getParentId(handle),
        profile: await this.getUserInfo(handle),
        date: await this.getCommentDate(handle),
      }),
    );
    return Promise.all(comments);
  }

  private async getCommentDate(handle: ElementHandle<Node>) {
    const date = (await handle.$eval('b.date', (el) => el.textContent)).replace(
      ' пожаловаться',
      '',
    );
    return replaceNbsp(date);
  }

  private async getUserPhoto(handle: ElementHandle<Node>) {
    try {
      return await handle.$eval('div.toppy>img', (el) =>
        el.getAttribute('src'),
      );
    } catch {
      return null; // увы - отсутствие этого элемента вполне допустимо - больше задержек
    }
  }

  private async getParentId(handle: ElementHandle<Node>) {
    try {
      const gotoParent = await handle.$eval(
        'b.arrows>a[onclick*="gotoParent"]',
        (el) => el.getAttribute('onclick'),
      );
      const regexp = /gotoParent\((?<parentId>\d*), *(?<commentId>\d*)\)/;
      if (regexp.test(gotoParent)) {
        return regexp.exec(gotoParent).groups.parentId;
      }
    } catch {
      return;
    }
  }

  private async getCommentId(handle: ElementHandle<Node>) {
    const commentId = await handle.$eval('div.toppy', (el) =>
      el.getAttribute('id'),
    );
    return /comment(?<commentId>\d*)/.exec(commentId).groups.commentId;
  }

  private async getUserInfo(
    handle: ElementHandle<Node>,
  ): Promise<ParsedProfileDTO> {
    const photo = await this.getUserPhoto(handle);
    const { name, url } = await handle.$eval('p.profile_name>a.name', (el) => ({
      name: el.textContent,
      url: el.getAttribute('href'),
    }));
    return {
      photo: fullUrl(photo),
      url: fullUrl(url),
      nickname: name,
    };
  }
}
