const fs = require('fs')
const replays = fs.readdirSync('./replays/')
const W3GReplay = require('.')

replays.forEach((replayFile) => {
  try {
    console.log('============   ' + replayFile + '   =========')
    const test = new W3GReplay(`./replays/${replayFile}`)
    console.log(test.players)
    console.log(test.teams)
    console.log('==================================================================')
    console.log()
  } catch (ex) {
    console.log(replayFile)
    console.log(ex)
    process.exit(0)
  }
})
