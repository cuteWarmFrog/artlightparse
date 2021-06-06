const cheerio = require('cheerio');

const colorsPool = ['Grey', 'Black', 'White', 'Blue', 'Yellow', 'Matt grey', 'Silver', 'Matt black'];

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

        const specs: string[] = [];
        const prices: any = [];
        const $ = cheerio.load(html);

        $('.fined-items').each((i: number, element: any) => {

            specs.push(element.children[3].children[3].children[0].data.trim());

            if (element.children[5].children[1].attribs["class"] === "wrap-price") {
                try {
                    prices.push({
                        oldPrice: element.children[5].children[1].children[1].children[1].children[0].data.trim(),
                        newPrice: element.children[5].children[1].children[1].children[1].children[0].data.trim()
                    });
                } catch (err) {
                    prices.push({
                        oldPrice: element.children[5].children[1].children[1].children[0].data.trim(),
                        newPrice: element.children[5].children[1].children[1].children[0].data.trim()
                    });
                }
            }

            if (element.children[5].children[1].attribs["class"] === "wrap-double-price") {

                let newPrice = element.children[5].children[1].children[1].children[1].children[0].data;
                let oldPrice = element.children[5].children[1].children[3].children[1].children[0].data;
                prices.push({
                    newPrice,
                    oldPrice
                })
            }
        })

        for (let i = 0; i < specs.length; i++) {
            if (prices[i].oldPrice !== 'Цена по запросу') {
                distinctItems.push({
                    specs: specs[i],
                    price: prices[i]
                })
            }
        }

        let commonSpecs = this.getCommonSpecs(html);
        let specsPool = this.getSpecificSpecsPool(html);

        const items: any = [];

        for (let item of distinctItems) {
            let parts = item.specs.trim().split('(')
            let itemName = parts[0]
            let itemSpecs = parts[1].split(',').map((el: any) => el.trim().replace(')', ''));

            let finalItem = {
                'Наименование': itemName,
                'Старая цена': item.price.oldPrice,
                'Новая цена': item.price.newPrice,
                ...commonSpecs
            };
            for (let itemSpec of itemSpecs) {
                for (let specName in specsPool) {
                    if (specsPool[specName].includes(itemSpec)) {
                        finalItem[specName] = itemSpec
                    }
                }
                if (colorsPool.includes(itemSpec)) {
                    finalItem['Цвет'] = itemSpec;
                }
            }

            let baseArticle: any;
            $('h1').each((i: number, element: any) => {
                try {
                    baseArticle = element.children[0].data;
                } catch (err) {
                    baseArticle = specs[0].split('(')[0].trim();
                }

            })

            let articles = this.getArticles(finalItem, baseArticle);

            items.push({
                ...articles,
                ...finalItem
            });
        }

        return items;
    }


    private getArticles(item: object, baseArticle: string) {

        let string = Object.values(item).join('');

        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = Math.imul(31, hash) + string.charCodeAt(i) | 0;
        }
        let hashString = Math.abs(hash).toString();

        return {
            'ID': `${baseArticle}:${hashString}`,
            'Base article': baseArticle
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

        for (let spec in commonSpecs) {
            if (commonSpecs[spec].includes("Ø")) {
                let parts = commonSpecs["Размеры, мм"].split(" ");
                for (let part of parts) {
                    if (part[0] == 'Ø') {
                        commonSpecs["Диаметр"] = part.slice(1);
                    }
                    if (part[0] == 'H') {
                        commonSpecs["Высота"] = part.slice(1);
                    }
                }

            }
        }

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
