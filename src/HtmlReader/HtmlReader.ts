import {WebDriver, WebElement} from "selenium-webdriver";
require("chromedriver");
const webdriver = require('selenium-webdriver');
const until = webdriver.until;
const by = webdriver.By;

export class HtmlReader {
   readonly driver: WebDriver;
   readonly lamp: string = '.wrap-slider-card-product';

   constructor() {
      this.driver = new webdriver
         .Builder()
         .withCapabilities(webdriver.Capabilities.chrome())
         .build();
   }

   async getHtmlFromBrowser(url: string, elementSelectorToWait: string): Promise<string> {
      await this.driver.get(url);
      await this.driver.wait(until.elementLocated(by.css(elementSelectorToWait)), 45000);
      const element: WebElement = await this.driver.findElement(by.css('body'));
      return await element.getAttribute("innerHTML");
   }

}