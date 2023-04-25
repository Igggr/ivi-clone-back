import { Injectable } from '@nestjs/common';
import { Page } from 'puppeteer';
import { DOMEN } from '../constants';

@Injectable()
export class ReviewParserService {
    async parseComments(page: Page, film: number) {
        // по идее так я только первую страницу паршу - то есть надо дорабатывать
        const reviewsPage = `${DOMEN}/film/${film}/reviews/?ord=rating`;
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
