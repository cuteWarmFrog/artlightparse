export class ItemUnifier {


    unifyItems(items: Array<any>): Array<any> {

        let allSpecs: any = [];
        items.forEach((item: any) => allSpecs.push(...Object.keys(item)));
        allSpecs = new Set(allSpecs);

        items.forEach((item: any) => {
            allSpecs.forEach((spec: any) => {
                if (!item.hasOwnProperty(spec))
                    item[spec] = '';
            })
        });

        return items;
    }
}
