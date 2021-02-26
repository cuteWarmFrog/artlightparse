import {WebElement} from "selenium-webdriver";
import {Parser} from "./Parser/Parser";
import {Downloader} from "./Downloader/Downloader";
import {HtmlReader} from "./HtmlReader/HtmlReader";

const fs = require('fs');

const catalogUrl = 'https://artlight.ru/catalog/';

const categoriesSelector = '.wrap-cell-sidebar:first-child li a.a-big-drop';
const paginationSelector = '.wrap-pagination a';
const lastItemCardSelector = '.wrap-card-item-goods:last-child';
const itemLinkSelector = '.wrap-card-item-goods a';

const url = 'https://artlight.ru/catalog/vstraivaemye_svetilniki/art_1712/';

//Гипсовые мервты, комплексные системы - по запросу
const urlsToAvoid = [
   'https://artlight.ru/catalog/gipsovye_svetilniki/',
   'https://artlight.ru/catalog/kompleksnye_sistemy_bezopasnosti/'];

(async function MainWrapper() {

   const downloader = new Downloader();
   const htmlReader = new HtmlReader();
   const parser = new Parser();
   //
   // const catalogHtml = await htmlReader.getHtmlFromBrowser(catalogUrl, categoriesSelector);
   // const categoriesUrls = parser.getUrlsFromHtmlWithSelector(catalogHtml, categoriesSelector);
   // const allPageUrls = await getAllPageUrls(categoriesUrls, htmlReader, parser);
   // const allItemsUrls = await getAllItemsUrls(allPageUrls, htmlReader, parser);
   //
   // allItemsUrls.map((url: string, i:number) => {
   //    console.log(`${i}: ${url}`);
   // })

   //todo MAY BEE NO PAGINATION
   const html = await htmlReader.getHtmlFromBrowser(
      'https://artlight.ru/catalog/vstraivaemye_svetilniki/art_inline107/'
   ,'.wrap-big-img img');
   const urLsForDownload = parser.getResourcesUrls(html);

   for (const url of urLsForDownload) {
      console.log(url);
      await downloader.download(url);
   }

})();

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

