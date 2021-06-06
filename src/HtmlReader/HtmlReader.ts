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
      try {
         await this.driver.get(url);
         await this.driver.wait(until.elementLocated(by.css(elementSelectorToWait)), 45000);
         const element: WebElement = await this.driver.findElement(by.css('body'));
         return await element.getAttribute("innerHTML");
      } catch (err) {
         return "nothing";
      }
   }

   async getItemHtmlFromBrowser(url: string, elementSelectorToWait: string): Promise<string> {
      await this.driver.get(url);
      await this.driver.wait(until.elementLocated(by.css(elementSelectorToWait)), 45000);

      try {
         let i = 0;
         while(true) {
            if(i++ == 17) {
               throw 'Omg please stop it';
            }
            await new Promise((resolve, reject) =>
                   setTimeout(async ()=>{
                      try {
                         await this.findShowMore()
                         resolve("");
                      } catch(err){
                         reject(err)
                      }
                   }, 2000)
            )
         }

      } catch (err) {
         //так, простыми действиями можно обработать ошибку. Но зачем?
      }
      const element: WebElement = await this.driver.findElement(by.css('body'));
      return await element.getAttribute("innerHTML");
   }

   private async findShowMore() {
      await this.driver.wait(until.elementLocated(by.css('a.link-show-more')), 1500);
      const showMore: WebElement = this.driver.findElement(by.css('a.link-show-more'));
      await showMore.click();
   }
}