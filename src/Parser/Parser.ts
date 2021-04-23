const cheerio = require('cheerio');

const colors = ['Grey', 'Black', 'White', 'Blue', 'Yellow', '']

export class Parser {
    readonly pictureRegex = /\/upload\/iblock.*jpeg/gm;
    readonly archiveRegex = /\/upload\/iblock.*7z/gm;
    readonly pdfRegex = /\/upload.*монтажная инструкция3.pdf/gm;

    readonly urlBeginning = 'https://artlight.ru';

    getUrlsForDownload(html: string, regex: RegExp): string[] {
        const urlsForDownload: string[] = [];
        const result = html.match(regex) || [];
        const unique = new Set(result);
        unique.forEach((url: string) => {
            urlsForDownload.push(this.urlBeginning + url);
        });
        return urlsForDownload;
    }

    getResourcesUrlsForDownload(html: string): string[] {
        const pictures = this.getUrlsForDownload(html, this.pictureRegex);
        const archives = this.getUrlsForDownload(html, this.archiveRegex);
        const pdfs = this.getUrlsForDownload(html, this.pdfRegex);
        return pictures.concat(archives).concat(pdfs);
    }


    getUrlsFromHtmlWithSelector(html: string, urlSelector: string): string[] {
        const urls: string[] = [];
        const $ = cheerio.load(html);
        $(urlSelector).each((i: number, element: any) => {
            urls.push(this.urlBeginning + element.attribs.href);
        })
        return Parser.makeUnique(urls);
    }

    private static makeUnique(array: Array<any>): Array<any> {
        let unique = new Set(array);
        return Array.from(unique);
    }

    getDistinctItems(html: string, url: string) {
        let distinctItems: any = [];

        const Specs: string[] = [];
        const prices: number[] = [];
        const $ = cheerio.load(html);
        $('.fined-items .name-item').each((i: number, element: any) => {
            Specs.push(element.children[0].data);
        })

        $('.fined-items .current-price span').each((i: number, element: any) => {
            prices.push(element.children[0].data);
        })
        const delta = Specs.length - prices.length;
        Specs.splice(0, delta);

        for (let i = 0; i < Specs.length; i++) {
            distinctItems.push({
                specs: Specs[i],
                price: prices[i]
            })
        }

        // distinctItems = Array.from(new Set(distinctItems.map((item: any) => item.specs)))
        //     .map((specs: any) => {
        //         return {
        //             specs: specs,
        //             price: distinctItems.find((item: any) => item.specs === specs).price
        //         }
        //     })

        let commonSpecs = this.getCommonSpecs(html);
        let specsPool = this.getSpecificSpecsPool(html);

        const items: any = [];

        for (let item of distinctItems) {
            let parts = item.specs.trim().split('(')
            let itemName = parts[0]
            let itemSpecs = parts[1].split(',').map((el: any) => el.trim().replace(')', ''));

            let finalItem = {
                'Наименование': itemName,
                'Цена': item.price,
                ...commonSpecs
            };
            for (let itemSpec of itemSpecs) {
                for (let specName in specsPool) {
                    if (specsPool[specName].includes(itemSpec)) {
                        finalItem[specName] = itemSpec
                    }
                }
                if (colors.includes(itemSpec)) {
                    finalItem['Цвет'] = itemSpec;
                }
            }
            let articles = this.getArticles(finalItem, url);

            items.push({
                ...articles,
                ...finalItem
            });
        }

        return items;
    }


    private getArticles(item: object, url: string) {
        let split = url.split('/');
        let baseArticle = split[split.length - 2];

        let string = Object.values(item).join('');

        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = Math.imul(31, hash) + string.charCodeAt(i) | 0;
        }
        let hashString = Math.abs(hash).toString();

        return {
            'Уникальный артикул': `${baseArticle}:${hashString}`,
            'Базовый артикул': baseArticle
        }
    }


    //БЕЛЫЕ ОБЩИЕ
    private getCommonSpecs(html: string) {
        let commonSpecs: any = {};
        let $ = cheerio.load(html);

        $('.wrap-characteristic-photo .wrap-line-characteristic').each((i: number, element: any) => {

            let key: string = 'this will be removed';
            let value: string = 'this will be removed';
            let isKeyOrValue = 'key';
            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i].name === 'p') {
                    if (isKeyOrValue === 'key') {
                        key = element.children[i].children[0].data.trim();
                        isKeyOrValue = 'value';
                    } else {
                        value = element.children[i].children[0].data.trim();
                        isKeyOrValue = 'key';
                    }
                }
            }
            commonSpecs[key] = value;
        });
        return commonSpecs;
    }

    //ПУЛ ХАРАКТЕРИСТИК С ВЫБОРОМ
    private getSpecificSpecsPool(html: string) {
        let $ = cheerio.load(html);
        let specsPool: any = {};

        $('.wrap-group-radiobtn').each((i: number, groupEl: any) => {

                let key: string = 'that will be removed';
                let values: Array<any> = [];

                for (let i = 0; i < groupEl.children.length; i++) {
                    if (groupEl.children[i].name === 'p') {
                        key = groupEl.children[i].children[0].data;
                    }

                    //ПОСЛЕДНИЙ РАЗ Я ЮЗАЮ CHEERIO, ДА И САЙТЫ ПАРШУ ТОЖЕ ПОСЛЕДНИЙ РАЗ. КОД НИЖЕ ПРОСТО ПИЗДА, А ПО-ДРУГОМУ НИКАК)))
                    if (groupEl.children[i].name === 'label') {
                        for (let j = 0; j < groupEl.children[i].children.length; j++) {
                            if (groupEl.children[i].children[j].name === 'p') {
                                values.push(groupEl.children[i].children[j].children[0].data);
                            }
                        }
                    }
                }
                specsPool[key] = values;
            }
        )
        return specsPool;
    }

}
