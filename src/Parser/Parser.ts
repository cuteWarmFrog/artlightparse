import Element = cheerio.Element;
import * as http from "http";

const cheerio = require('cheerio');


export class Parser {
   readonly pictureRegex = /\/upload\/iblock.*jpeg/gm;
   readonly archiveRegex = /\/upload\/iblock.*7z/gm;
   readonly urlBeginning = 'https://artlight.ru';

   getPictureURLs(html: string): string[] {
      const urlsForDownload: string[] = [];
      const result = html.match(this.pictureRegex) || [];
      const unique = new Set(result);
      unique.forEach((el: string) => {
         urlsForDownload.push(this.urlBeginning + el);
      });
      return urlsForDownload;
   }

   getArchiveUrls(html: string): string[] {
      const urlsForDownload: string[] = [];
      const result = html.match(this.archiveRegex) || [];
      const unique = new Set(result);
      unique.forEach((url: string) => {
         urlsForDownload.push(this.urlBeginning + url);
      });
      return urlsForDownload;
   }

   getResourcesUrls(html: string): string[] {
      const pictures = this.getPictureURLs(html);
      const archives = this.getArchiveUrls(html);
      return pictures.concat(archives);
   }

   //TODO НИЖМЕ 3 ФУНКЦИЯ ПОЧТИ ОДИНАКОВЫЕ, ЧУВАК, СТЫДНО!!!!!

   getCategoriesUrls(html: string, categoriesSelector: string): string[] {
      const categoriesUrls: string[] = [];
      const $ = cheerio.load(html);
      $(categoriesSelector).each(
         (i: number, element: any) => {
            categoriesUrls.push(this.urlBeginning + element.attribs.href);
         }
      )
      return categoriesUrls;
   }

   getPagesUrls(html: string, paginationSelector: string): string[] {
      const pagesUrls: string[] = [];
      const $ = cheerio.load(html);
      $(paginationSelector).each((i: number, element: any) => {
         pagesUrls.push(this.urlBeginning + element.attribs.href);
      })
      return Parser.makeUnique(pagesUrls);
   }

   getItemUrls(html: string, itemSelector: string): string[] {
      const itemsUrls: string[] = [];
      const $ = cheerio.load(html);
      $(itemSelector).each((i: number, element: any) => {
         itemsUrls.push(this.urlBeginning + element.attribs.href);
      })
      return Parser.makeUnique(itemsUrls);
   }

   getUrlsFromHtmlWithSelector(html: string, urlSelector: string): string[] {
      const urls: string[] = [];
      const $ = cheerio.load(html);
      $(urlSelector).each((i:number, element: any) => {
         urls.push(this.urlBeginning + element.attribs.href);
      })
      return Parser.makeUnique(urls);
   }

   private static makeUnique(array: Array<any>): Array<any> {
      let unique = new Set(array);
      return Array.from(unique);
   }

}
