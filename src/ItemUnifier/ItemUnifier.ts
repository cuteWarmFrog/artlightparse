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

        return this.makeUnique(items);
    }

    private makeUnique(items: Array<any>): Array<any> {
        const IDs = this.getIDs(items);
        const uniqueIDs = Array.from(new Set(IDs));

        return uniqueIDs.reduce<Array<any>>((acc: Array<any>, id: string) => {
            const ourItem = items.find((item: any) => item['ID'] === id)
            return acc.concat([ourItem]);
        }, [])
    }

    private getIDs(json: Array<object>): Array<string> {
        const ids = json.reduce<Array<string>>((acc: Array<string>, el: any) => {
            const id = el['ID'];
            return acc.concat([id]);
        }, [])
        return Array.from(ids);
    }
}
