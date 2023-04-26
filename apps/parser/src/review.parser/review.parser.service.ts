import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import { DOMEN, fullUrl } from '../constants';
import {
  nextPageXpath,
  reviewBodyXpath,
  reviewPageXpath,
  reviewTitleXpath,
  reviewerXpath,
} from '../xpath/reviews';

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

  // TODO: should also parse comments? perhaps form form tree-like structure
  async parseOneReview(page: Page, url: string) {
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    const title = await page.$eval(
      `xpath/${reviewTitleXpath}`,
      (el) => el.textContent,
    );
    const body = await page.$eval(
      `xpath/${reviewBodyXpath}`,
      (el) => el.innerHTML,
    );
    const { userName, userUrl } = await page.$eval(
      `xpath/${reviewerXpath}`,
      (el) => ({ userName: el.textContent, userUrl: el.getAttribute('href') }),
    );

    return {
      url,
      title,
      body,
      user: {
        userName,
        url: fullUrl(userUrl),
      },
    };
  }
}
