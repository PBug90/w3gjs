const fs = require('fs')
const replays = fs.readdirSync('./replays/')
const W3GReplay = require('.')
const W3GParser = new W3GReplay()

function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Bytes';
   var k = 1024,
       dm = decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

replays.forEach((replayFile) => {
  const parser = new W3GReplay()
  const parseResult = parser.parse(`./replays/${replayFile}`)
  console.log(formatBytes(Buffer.byteLength(JSON.stringify(parseResult), 'utf8')))
})
