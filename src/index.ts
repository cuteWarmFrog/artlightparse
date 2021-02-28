import {WebElement} from "selenium-webdriver";
import {Parser} from "./Parser/Parser";
import {Downloader} from "./Downloader/Downloader";
import {HtmlReader} from "./HtmlReader/HtmlReader";
import {ItemProcessor} from "./ItemProcessor/ItemProcessor";

const fs = require('fs');

const catalogUrl = 'https://artlight.ru/catalog/';

const categoriesSelector = '.wrap-cell-sidebar:first-child li a.a-big-drop';
const paginationSelector = '.wrap-pagination a';
const lastItemCardSelector = '.wrap-card-item-goods:last-child';
const itemLinkSelector = '.wrap-card-item-goods a';
const sliderCardSelector = '.slider-card-product';

const url = 'https://artlight.ru/catalog/vstraivaemye_svetilniki/art_1712/';

//Гипсовые мервты, комплексные системы - по запросу
const urlsToAvoid = [
   'https://artlight.ru/catalog/gipsovye_svetilniki/',
   'https://artlight.ru/catalog/kompleksnye_sistemy_bezopasnosti/'];

(async function MainWrapper() {
   const htmlReader = new HtmlReader();
   const parser = new Parser();
   const itemUrlWithMore = 'https://artlight.ru/catalog/vstraivaemye_svetilniki/art_1013/';
   const itemUrlWithoutMore = 'https://artlight.ru/catalog/trekovye_svetilniki/art_focus66/';

   const itemHtml = await htmlReader.getItemHtmlFromBrowser(itemUrlWithMore, sliderCardSelector);
   const distinctItems =  parser.getItemSpecs(itemHtml);



})();

async function makeSomeMagic() {
   const downloader = new Downloader();
   const htmlReader = new HtmlReader();
   const parser = new Parser();

   const catalogHtml = await htmlReader.getHtmlFromBrowser(catalogUrl, categoriesSelector);
   const categoriesUrls = parser.getUrlsFromHtmlWithSelector(catalogHtml, categoriesSelector);
   const allPageUrls = await getAllPageUrls(categoriesUrls, htmlReader, parser);
   const allItemsUrls = await getAllItemsUrls(allPageUrls, htmlReader, parser);

   const itemProcessor = new ItemProcessor();

   for(let itemUrl of allItemsUrls) {
      console.log(`${url}`);

      let itemHtml = await htmlReader.getHtmlFromBrowser(url, sliderCardSelector);
      itemProcessor.processItem(itemHtml);
   }
}

async function getAllPageUrls(categoriesUrls: string[], htmlReader: HtmlReader, parser: Parser): Promise<string[]> {
   const allPageUrls: string[] = [];
   for(let categoryUrl of categoriesUrls) {
      if(!urlsToAvoid.includes(categoryUrl)) {
         const categoryHtml = await htmlReader.getHtmlFromBrowser(categoryUrl, lastItemCardSelector);
         const pagesUrls = parser.getUrlsFromHtmlWithSelector(categoryHtml, paginationSelector);
         pagesUrls.push(categoryUrl);
         allPageUrls.push(...pagesUrls);
      }
   }
   return allPageUrls;
}

async function getAllItemsUrls(allPageUrls: string[], htmlReader: HtmlReader, parser: Parser) {
   const allItemsUrls: string[] = [];
   for(let pageUrl of allPageUrls) {
      const pageHtml = await htmlReader.getHtmlFromBrowser(pageUrl, lastItemCardSelector);
      const itemsUrls = parser.getUrlsFromHtmlWithSelector(pageHtml, itemLinkSelector);
      allItemsUrls.push(...itemsUrls);
   }
   return allItemsUrls;
}

function getHtmlFromTextFile(): string {
   return fs.readFileSync('../dist/checkHtml.txt', 'utf8')
}

