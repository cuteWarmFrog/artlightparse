const Path = require('path');
const Axios = require('axios');
const fs = require('fs')

export class Downloader {

   async download(url: string, baseName: string) {

      const response = await Axios({
         method: 'GET',
         url: url,
         responseType: 'stream'
      })

      response.data.pipe(fs.createWriteStream(this.generatePath(url, baseName)));
   }

   pickAName(url: string, baseName: string): string {
      let parts = url.split('/');
      let name =  parts[parts.length - 1];
      if(name.includes('size')) {
         name = baseName + '-' + 'size' + '-' + (name.replace(baseName, '').replace("size", ''));
         return name.replace(" ", '');
      }

      return (baseName + '-' + (name.replace(baseName, ''))).replace(" ", '');
   }

   generatePath(url: string, baseName: string): any {
      return Path.resolve(__dirname, '../../content/photos', this.pickAName(url, baseName));
   }
}