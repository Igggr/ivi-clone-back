import { Test, TestingModule } from '@nestjs/testing';
import { ActorParserService } from './actor.parser.service';
import { actorsXpath } from '../xpath/role';
import puppeteer, { Browser, Page } from 'puppeteer';
const mockPuppeteerGoto = require('mock-puppeteer-goto');



describe('ActorParserService', () => {
  let service: ActorParserService;
  let browser: Browser;
  let page: Page;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActorParserService],
    }).compile();

    service = module.get<ActorParserService>(ActorParserService);

    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();
  });

  it('should be defined', async () => {
    const mock = mockPuppeteerGoto(page, {
      paths: {
        'http://url.com': 'apps/parser/src/actor.parser/actor.html'
      }
    }
  )
    await page.goto('http://url.com')

    const actors = await service.parsePersonsWithRole(page, actorsXpath);
    const expected = [
      {
        dub: undefined,
        fullName: "Тим Роббинс",
        fullNameEn: "Tim Robbins",
        photo: "https://www.kinopoisk.ru//images/sm_actor/7987.jpg",
        role: "... Andy Dufresne",
        url: "https://www.kinopoisk.ru//name/7987/",
      }
    ]

    expect(actors).toEqual(expected);
    mock.restore();
  });


  afterEach(async () => {
    await page.close();
    await browser.close()
  })
});
