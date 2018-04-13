const fs = require('fs')
const replays = fs.readdirSync('./replays/')
const W3GReplay = require('.')
replays.forEach((replayFile) => {
  const test = new W3GReplay(`./replays/${replayFile}`)
  console.log(test)
  process.exit(1)
})
