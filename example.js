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

/*

Chronological order of Blocks when calling EventEmitters callbacks is guaranteed.

You can decide how to proceed and what kind of blocks you want to know about.
Check the W3GReplay.ts file for a reference on how to listen to the callbacks.

If you need to track the current time, access W3GParser.msElapsed property which keeps track of
the time elapsed while parsing the replay file.

W3GParser.on('gamedatablock', (block) => console.log('game data block.'))
W3GParser.on('timeslotblock', (block) => console.log('time slot block.', W3GParser.msElapsed))
W3GParser.on('commandblock', (block) => console.log('command block.'))
W3GParser.on('actionblock', (block) => console.log('action block.'))

*/

replays.forEach((replayFile) => {
  const parseResult = W3GParser.parse(`./replays/${replayFile}`)
  // console.log(parseResult)
  console.log(replayFile)
  console.log(replayFile, formatBytes(Buffer.byteLength(JSON.stringify(parseResult), 'utf8')))
  console.log('=====')
  // process.exit()
})
