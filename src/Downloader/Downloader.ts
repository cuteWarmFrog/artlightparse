const Path = require('path');
const Axios = require('axios');
const fs = require('fs')

export class Downloader {

   async download(url: string) {

      const response = await Axios({
         method: 'GET',
         url: url,
         responseType: 'stream'
      })

      response.data.pipe(fs.createWriteStream(this.generatePath(url)));
   }

   pickAName(url: string): string {
      let parts = url.split('/');
      return parts[parts.length - 1];
   }

   generatePath(url: string): any {
      return Path.resolve(__dirname, '../../content/photos', this.pickAName(url));
   }
}