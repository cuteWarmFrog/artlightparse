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
      const regex = /ART.*(jpeg|7z)/;
      return (url.match(regex) || [])[0];
   }

   generatePath(url: string): any {
      console.log(this.pickAName(url));
      return Path.resolve(__dirname, '../../files', this.pickAName(url));
   }
}