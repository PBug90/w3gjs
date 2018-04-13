const fs = require('fs')
const zlib = require('zlib')
const { Parser } = require('binary-parser')
const { ActionBlockList } = require('../parsers/actions')
const { ReplayHeader,
  EncodedMapMetaString,
  GameMetaData} = require('../parsers/header')

const { GameDataParser } = require('../parsers/gamedata')

const GameDataParserComposed = new Parser()
  .nest('meta', {type: GameMetaData})
  .nest('blocks', {type: GameDataParser})

function W3GReplay (path) {
  this.buffer = fs.readFileSync(path)
  this.header = ReplayHeader.parse(this.buffer)

  const decompressed = this.header.blocks.map((block) => {
    return zlib.inflateSync(block.compressed, { finishFlush: zlib.constants.Z_SYNC_FLUSH })
  })

  this.decompressed = Buffer.concat(decompressed)
  this.gameMetaDataDecoded = GameDataParserComposed.parse(this.decompressed)

  this.decodedMetaStringBuffer = this.decodeGameMetaString(this.gameMetaDataDecoded.meta.encodedString)
  this.gameMetaInfo = EncodedMapMetaString.parse(this.decodedMetaStringBuffer)

  this.slots = this.gameMetaDataDecoded.meta.playerSlotRecords
  this.playerList = [this.gameMetaDataDecoded.meta.player, ...this.gameMetaDataDecoded.meta.playerList]

  this.createPlayerList()
  this.processGameDataBlocks()

  delete this.slots
  delete this.playerList

  return this
}

W3GReplay.prototype.createPlayerList = function () {
  this.teams = {}
  this.players = {}
  this.playerList.forEach(player => { this.players[player.playerId] = player })

  this.slots.forEach(slot => {
    this.players[slot.playerId] = { ...this.players[slot.playerId], ...slot }
    this.teams[slot.teamNo] = this.teams[slot.teamNo] || {}
    this.teams[slot.teamNo][slot.playerId] = this.players[slot.playerId]
  })
}

W3GReplay.prototype.processGameDataBlocks = function () {
  this.chatlog = []
  this.gameLeaveEvents = []
  this.w3mmd = []
  this.playerActions = {}
  this.playerList.forEach(player => { this.playerActions[player.playerId] = 0 })
  this.totalTimeTracker = 0
  this.gameMetaDataDecoded.blocks.forEach((block) => {
    if (block.type === 31 || block.type === 30) {
      this.totalTimeTracker += block.data.timeIncrement
      this.processTimeSlot(block)
    } else if (block.type === 32) {
      this.chatlog.push(block.data)
    } else if (block.type === 23) {
      this.gameLeaveEvents.push(block.data)
    }
  })
}

W3GReplay.prototype.processTimeSlot = function (block) {
  block.data.actions.forEach(actionBlock => {
    try {
      ActionBlockList.parse(actionBlock.actions).forEach(action => {
        switch (action.actionId) {
          case 0x10:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x11:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x12:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x13:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x14:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x16:
            // this.playerActions[actionBlock.playerId]++
            break
          case 0x17:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x18:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x1C:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x1D:
          case 0x1E:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x61:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x65:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x6b:
            this.w3mmd.push(action.data)
            break
          case 0x66:
            this.playerActions[actionBlock.playerId]++
            break
          case 0x67:
            this.playerActions[actionBlock.playerId]++
            break
        }
      })
    } catch (ex) {
      console.log('could not parse this action block.')
    }
  })
}

W3GReplay.prototype.decodeGameMetaString = function (str) {
  let test = Buffer.from(str, 'hex')
  let decoded = new Buffer(test.length)
  let mask = 0
  let dpos = 0

  for (let i = 0; i < test.length; i++) {
    if (i % 8 === 0) {
      mask = test[i]
    } else {
      if ((mask & (0x1 << (i % 8))) === 0) {
        decoded.writeUInt8(test[i] - 1, dpos++)
      } else {
        decoded.writeUInt8(test[i], dpos++)
      }
    }
  }
  return decoded
}

module.exports = W3GReplay
