const fs = require('fs')
const replays = fs.readdirSync('./replays/')
const W3GReplay = require('.')
const W3GParser = new W3GReplay()

function formatBytes (bytes, decimals) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals || 2
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

replays.forEach((replayFile) => {
  const parseResult = W3GParser.parse(`./replays/${replayFile}`)
  console.log(formatBytes(Buffer.byteLength(JSON.stringify(parseResult), 'utf8')))
})
