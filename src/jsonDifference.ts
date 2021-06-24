//needed to be run from /dist
const JSONToCSV = require('json2csv').parse;
const fs = require('fs');
import dateFormat = require("dateformat");

let formsOfWordItem = ['предмет', 'предмета', 'предметов'];

const oldJsonName = process.argv[2];
const newJsonName = process.argv[3];

const oldItems = JSON.parse(fs.readFileSync(`../content/jsons/${oldJsonName}`, {encoding: "utf8"}));
const newItems = JSON.parse(fs.readFileSync(`../content/jsons/${newJsonName}`, {encoding: "utf8"}));


let itemsToDelete = oldItems.filter((oldItem: any) => {
    let flag = true;
    newItems.forEach((newItem: any) => {
        if(oldItem['ID'] == newItem['ID'])
            flag = false;
    })
    return flag;
})

let itemsToAdd = newItems.filter((newItem: any) => {
    let flag = true;
    oldItems.forEach((oldItem: any) => {
        if(oldItem['ID'] == newItem['ID'])
            flag = false;
    })
    return flag
})

let currentFormattedDate = getDateFormatted();

if(itemsToDelete.length > 0) {
    fs.writeFileSync(`../content/difference/itemsToDelete_${currentFormattedDate}.csv`, makeCSV(itemsToDelete));
    console.log(`Из каталога удалили ${itemsToDelete.length} ${getWordForm(itemsToDelete.length, formsOfWordItem)}.`);
} else {
    console.log(`Из каталога ничего не удалили.`);
}

if(itemsToAdd.length > 0) {
    fs.writeFileSync(`../content/difference/itemsToAdd_${currentFormattedDate}.csv`, makeCSV(itemsToAdd));
    console.log(`В каталог добавили ${itemsToAdd.length} ${getWordForm(itemsToAdd.length, formsOfWordItem)}.`);
} else {
    console.log('В каталог ничего не добавили.');
}

function getWordForm(n: number, text_forms: Array<string>) {
    n = Math.abs(n) % 100;
    let n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

function getDateFormatted(): string {
    let now = new Date();
    return dateFormat(now, "mmmm_dS_h_MM_ss_TT");
}

function makeCSV(result: Array<object>) {
    return JSONToCSV(result, {fields: Object.keys(result[0])});
}