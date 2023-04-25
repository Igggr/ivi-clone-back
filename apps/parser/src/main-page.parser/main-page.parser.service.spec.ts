import { Test, TestingModule } from '@nestjs/testing';
import { MainPageParserService } from './main-page.parser.service';
import puppeteer, { Page } from 'puppeteer';
import * as jest from 'jest';

describe('MainpageParserService', () => {
  let service: MainPageParserService;
  // let browser;
  // let page;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainPageParserService],
    }).compile();

    service = module.get<MainPageParserService>(MainPageParserService);
    
    // browser = await puppeteer.launch({
    //   ignoreHTTPSErrors: true,
    // });
    // page = await browser.newPage();

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // afterEach(async () => {
  //   await page.close();
  //   await browser.close();
  // })
});
