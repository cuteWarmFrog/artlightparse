import {Parser} from "./Parser/Parser";
import {Downloader} from "./Downloader/Downloader";
import {HtmlReader} from "./HtmlReader/HtmlReader";
import {ItemUnifier} from "./ItemUnifier/ItemUnifier";
import dateFormat = require("dateformat");

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
    let beginTime = Date.now();
    // const htmlReader = new HtmlReader();
    // const parser = new Parser();
    // const itemUrlWithMore = 'https://artlight.ru/catalog/vstraivaemye_svetilniki/art_r_315/';
    // const itemUrlWithoutMore = 'https://artlight.ru/catalog/trekovye_svetilniki/art_focus66/';

    // const itemHtml = await htmlReader.getItemHtmlFromBrowser(itemUrlWithMore, sliderCardSelector);
    // const distinctItems =  parser.getDistinctItems(itemHtml);

    // console.log(distinctItems);
    await makeSomeMagic(beginTime);

})();

//todo сделать возможность начать с какого-то номера item.

//todo сделать возожность объединять json-ы

async function makeSomeMagic(beginTime: number) {
    const downloader = new Downloader();
    const htmlReader = new HtmlReader();
    const parser = new Parser();

    const catalogHtml = await htmlReader.getHtmlFromBrowser(catalogUrl, categoriesSelector);
    const categoriesUrls = parser.getUrlsFromHtmlWithSelector(catalogHtml, categoriesSelector);
    const allPageUrls = await getAllPageUrls(categoriesUrls, htmlReader, parser);
    const allItemsUrls = await getAllItemsUrls(allPageUrls, htmlReader, parser);

    // const allItemsUrls = JSON.parse(fs.readFileSync('content/allUrls.json', {encoding: 'utf8'}));
    // fs.writeFileSync('content/allUrls.json' , JSON.stringify(allItemsUrls));

    const specificItems: any = [];

    let i = 1;
    for (let itemUrl of allItemsUrls) {

        try {
            console.clear();
            console.log(`Processing: ${i++}|${allItemsUrls.length}`);
            console.log(`Already found ${specificItems.length} items. Trying to find more...`)

            let itemHtml = await htmlReader.getItemHtmlFromBrowser(itemUrl, sliderCardSelector);
            let distinctItems = parser.getDistinctItems(itemHtml, itemUrl);

            specificItems.push(...distinctItems);

            let urlsForDownloading = parser.getResourcesUrlsForDownload(itemHtml);

            if (distinctItems.length > 0) {
                for (let url of urlsForDownloading) {
                    await downloader.download(url, distinctItems[0]['Base article']);
                }
            }
        } catch (err) {
            console.log("Ыыыыы")
        }


        if (i == 20) {
            console.log('пока хватит');
            break;
        }
    }


    const itemsUnifier = new ItemUnifier();
    const unifiedItems = itemsUnifier.unifyItems(specificItems);

    fs.writeFileSync(`content/jsons/items_${getDateFormatted()}.json`, JSON.stringify(unifiedItems));

    let diff = Date.now() - beginTime;
    let minutes = Math.round(diff / 60000);
    let seconds = Math.round((diff % 60000) / 1000);
    console.log(`Working time: ${minutes} minutes and ${seconds} seconds.`);
}

function getDateFormatted(): string {
    let now = new Date();
    return dateFormat(now, "mmmm_dS_h_MM_ss_TT");
}

async function getAllPageUrls(categoriesUrls: string[], htmlReader: HtmlReader, parser: Parser): Promise<string[]> {
    const allPageUrls: string[] = [];
    let i = 1;
    for (let categoryUrl of categoriesUrls) {

        console.clear();
        console.log(`getting page urls \nProcessing ${i++}/${categoriesUrls.length} category url.`);

        if (!urlsToAvoid.includes(categoryUrl)) {
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
    let i = 1;
    for (let pageUrl of allPageUrls) {

        console.clear();
        console.log(`Getting item urls \nProcessing ${i++}/${allPageUrls.length} page url.`);

        const pageHtml = await htmlReader.getHtmlFromBrowser(pageUrl, lastItemCardSelector);
        const itemsUrls = parser.getUrlsFromHtmlWithSelector(pageHtml, itemLinkSelector);
        allItemsUrls.push(...itemsUrls);
    }
    return allItemsUrls;
}

function getHtmlFromTextFile(): string {
    return fs.readFileSync('../dist/checkHtml.txt', 'utf8')
}

