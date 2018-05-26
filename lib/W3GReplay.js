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

const Player = require('./Player')

function W3GReplay () {
  return this
}

W3GReplay.prototype.parse = function (filepath) {
  console.time('parse')
  this.buffer = fs.readFileSync(filepath)
  this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))

  this.header = ReplayHeader.parse(this.buffer)

  const decompressed = this.header.blocks.map((block) => {
    return zlib.inflateSync(block.compressed, { finishFlush: zlib.constants.Z_SYNC_FLUSH })
  })

  this.decompressed = Buffer.concat(decompressed)
  this.gameMetaDataDecoded = GameDataParserComposed.parse(this.decompressed)

  this.decodedMetaStringBuffer = this.decodeGameMetaString(this.gameMetaDataDecoded.meta.encodedString)
  this.meta = Object.assign({}, this.gameMetaDataDecoded, EncodedMapMetaString.parse(this.decodedMetaStringBuffer))

  this.slots = this.gameMetaDataDecoded.meta.playerSlotRecords
  this.playerList = [this.gameMetaDataDecoded.meta.player, ...this.gameMetaDataDecoded.meta.playerList]

  this.playerActionTrackInterval = 60000 // apm tracking interval in milliseconds

  this.createPlayerList()
  this.processGameDataBlocks()

  Object.values(this.players).forEach(p => p.newActionTrackingSegment(this.playerActionTrackInterval))

  this.cleanup()

  console.timeEnd('parse')
  console.log('Total: ', this.totalTimeTracker)
  return Object.assign({}, this)
}

W3GReplay.prototype.createPlayerList = function () {
  const tempPlayers = {}
  this.teams = {}
  this.players = {}

  this.playerList.forEach(player => {
    tempPlayers[player.playerId] = player
  })

  this.slots.forEach(slot => {
    if (slot.slotStatus > 1) {
      this.players[slot.playerId] = { ...this.players[slot.playerId], ...slot }
      this.teams[slot.teamId] = this.teams[slot.teamId] || []
      this.teams[slot.teamId].push(slot.playerId)
      this.players[slot.playerId] =
        new Player(slot.playerId, tempPlayers[slot.playerId].playerName, slot.teamId, slot.color, slot.raceFlag)
    }
  })
}

W3GReplay.prototype.processGameDataBlocks = function () {
  this.chatlog = []
  this.leaveEvents = []
  this.w3mmd = []

  this.totalTimeTracker = 0
  this.timeSegmentTracker = 0
  this.gameMetaDataDecoded.blocks.forEach((block) => {
    switch (block.type) {
      case 31:
      case 30:
        this.totalTimeTracker += block.timeIncrement
        this.timeSegmentTracker += block.timeIncrement
        if (this.timeSegmentTracker > this.playerActionTrackInterval) {
          Object.values(this.players).forEach((p) => p.newActionTrackingSegment())
          this.timeSegmentTracker = 0
        }
        this.processTimeSlot(block)
        break
      case 32:
        block.timeMS = this.totalTimeTracker
        this.chatlog.push(block)
        break
      case 23:
        this.leaveEvents.push(block)
        break
    }
  })

  this.chatlog = this.chatlog.map(elem => (elem.playerName = this.players[elem.playerId].name))
  delete this.temporaryAPMTracker
}

W3GReplay.prototype.processTimeSlot = function (timeSlotBlock) {
  timeSlotBlock.actions.forEach(actionBlock => {
    this.processCommandDataBlock(actionBlock)
  })
}

W3GReplay.prototype.processCommandDataBlock = function (actionBlock) {
  const currentPlayer = this.players[actionBlock.playerId]
  let lastActionWasDeselect = false

  try {
    ActionBlockList.parse(actionBlock.actions).forEach(action => {
      switch (action.actionId) {
        case 0x10:
          currentPlayer.handle0x10(action.itemId)
          break
        case 0x11:
          currentPlayer.handle0x11(action.itemId)
          break
        case 0x12:
          currentPlayer.handle0x12(action.itemId)
          break
        case 0x13:
          currentPlayer.handle0x13(action.itemId)
          break
        case 0x14:
          currentPlayer.handle0x14(action.itemId1)
          break
        case 0x16:
          if (action.selectMode === 0x02) {
            lastActionWasDeselect = true
            currentPlayer.handle0x16(action.selectMode, true)
          } else {
            if (lastActionWasDeselect === false) {
              currentPlayer.handle0x16(action.selectMode, true)
            }
            lastActionWasDeselect = false
          }
          break
        case 0x17:
          currentPlayer.handle0x17()
          break
        case 0x18:
          currentPlayer.handle0x18()
          break
        case 0x1C:
          currentPlayer.handle0x1C()
          break
        case 0x1D:
          currentPlayer.handle0x1D()
          break
        case 0x1E:
          currentPlayer.handle0x1E()
          break
        case 0x61:
          currentPlayer.handle0x61()
          break
        case 0x65:
          break
        case 0x6b:
          this.w3mmd.push(action)
          break
        case 0x66:
          currentPlayer.handle0x66()
          break
        case 0x67:
          currentPlayer.handle0x67()
          break
      }
    })
  } catch (ex) {
    console.error(ex)
  }
}

W3GReplay.prototype.decodeGameMetaString = function (str) {
  let test = Buffer.from(str, 'hex')
  let decoded = Buffer.alloc(test.length)
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

W3GReplay.prototype.cleanup = function () {
  Object.values(this.players).forEach(p => p.cleanup())
  delete this.slots
  delete this.playerList
  delete this.buffer
  delete this.decompressed
  delete this.gameMetaDataDecoded
  delete this.decodedMetaStringBuffer
  delete this.header.blocks
  delete this.apmTimeSeries
}

module.exports = W3GReplay