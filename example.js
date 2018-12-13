const fs = require('fs')

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

// const replays = ['z1.302.w3g']
const replays = fs.readdirSync('./replays/')
replays.forEach((replayFile) => {
  console.log(replayFile)
  const parseResult = W3GParser.parse(`./replays/${replayFile}`)
  // console.log(parseResult)
  console.log(formatBytes(Buffer.byteLength(JSON.stringify(parseResult), 'utf8')))
  console.log(parseResult.chat)
  process.exit()
})
