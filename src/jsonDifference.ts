const fs = require('fs');
import {getDateFormatted} from './index'

let formsOfWordItem = ['предмет', 'предмета', 'предметов'];

const oldJsonName = process.argv[2];
const newJsonName = process.argv[3];

const oldItems = JSON.parse(fs.readFileSync(`content/jsons/${oldJsonName}`, {encoding: "utf8"}));
const newItems = JSON.parse(fs.readFileSync(`content/jsons/${newJsonName}`, {encoding: "utf8"}));


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
fs.writeFileSync(`content/difference/itemsToDelete_${currentFormattedDate}.json`, JSON.stringify(itemsToDelete));
fs.writeFileSync(`content/difference/itemsToAdd_${currentFormattedDate}.json`, JSON.stringify(itemsToAdd));

console.log(`Из каталога удалили ${itemsToDelete.length} ${getWordForm(itemsToDelete.length, formsOfWordItem)}.`);
console.log(`В каталог добавили ${itemsToDelete.length} ${getWordForm(itemsToAdd.length, formsOfWordItem)}.`);

function getWordForm(n: number, text_forms: Array<string>) {
    n = Math.abs(n) % 100;
    let n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}