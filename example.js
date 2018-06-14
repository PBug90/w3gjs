const fs = require('fs')
const replays = fs.readdirSync('./replays/')
const W3GReplay = require('.')
const W3GParser = new W3GReplay()

replays.forEach((replayFile) => {
  try {
    console.log('============   ' + replayFile + '   =========')
    const test = W3GParser.parse(`./replays/${replayFile}`)
    console.log(test.players)
    console.log(test.teams)
    console.log('==================================================================')
    console.log()
    process.exit(0)
  } catch (ex) {
    console.log(replayFile)
    console.log(ex)
    process.exit(0)
  }
})
