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

function W3GReplay (path) {
  console.time('parse')
  this.buffer = fs.readFileSync(path)
  this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))
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
  delete this.buffer
  delete this.decompressed
  delete this.gameMetaDataDecoded
  delete this.decodedMetaStringBuffer
  delete this.header.blocks
  delete this.apmTimeSeries
  console.timeEnd('parse')
  console.log(this.players["1"])
  return this
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
        new Player(slot.playerId,tempPlayers[slot.playerId].playerName,slot.teamId,slot.color,slot.raceFlag)
    }
  })
}

W3GReplay.prototype.processGameDataBlocks = function () {
  this.chatlog = []
  this.gameLeaveEvents = []
  this.w3mmd = []
  this.playerActions = {}
  this.playerActionTrackInterval = 10000 // apm tracking interval in milliseconds
  this.timeTrackerObject = {} // a single time tracking object, create a prototype right here
  this.playerTrackers  = {}

  this.temporaryAPMTracker = {tracker: 0, timeSeries: [], current: Object.create(this.timeTrackerObject)}
  this.totalTimeTracker = 0

  this.gameMetaDataDecoded.blocks.forEach((block) => {
    if (block.type === 31 || block.type === 30) {
      this.totalTimeTracker += block.data.timeIncrement
      this.processTimeSlot(block)
    } else if (block.type === 32) {
      block.data.timeMS = this.totalTimeTracker
      this.chatlog.push(block.data)
    } else if (block.type === 23) {
      this.gameLeaveEvents.push(block.data)
    }
  })
  this.temporaryAPMTracker.timeSeries.push(this.temporaryAPMTracker.current)
  this.apmTimeSeries = this.temporaryAPMTracker.timeSeries
  this.chatlog = this.chatlog.map((elem) => {
    elem.playerName = this.players[elem.playerId].playerName
    return elem
  })

  delete this.temporaryAPMTracker
}

W3GReplay.prototype.processTimeSlot = function (block) {
  this.temporaryAPMTracker.tracker += block.data.timeIncrement

  if (this.temporaryAPMTracker.tracker >= this.playerActionTrackInterval) {
    this.temporaryAPMTracker.tracker = 0
    this.temporaryAPMTracker.timeSeries.push(this.temporaryAPMTracker.current)
    this.temporaryAPMTracker.current = Object.create(this.timeTrackerObject)
  }

  block.data.actions.forEach(actionBlock => {
    try {
      ActionBlockList.parse(actionBlock.actions).forEach(action => {
        let isAPMAction = false
        switch (action.actionId) {
          case 0x10:
            this.players[actionBlock.playerId].trackGameEntity(0x10, action.data.itemId)
            break
          case 0x11:
            this.players[actionBlock.playerId].trackGameEntity(0x11, action.data.itemId)
            break
          case 0x12:
            this.players[actionBlock.playerId].trackGameEntity(0x12,action.data.itemId)
            break
          case 0x13:
            this.players[actionBlock.playerId].trackGameEntity(0x13,action.data.itemId)
            break
          case 0x14:
            this.players[actionBlock.playerId].trackGameEntity(0x14,action.data.itemId1)
            break
          case 0x16:
            this.players[actionBlock.playerId].trackGameEntity(0x14)
            break
          case 0x17:
            this.players[actionBlock.playerId].trackGameEntity(0x17)
            break
          case 0x18:
            this.players[actionBlock.playerId].trackGameEntity(0x18)
            break
          case 0x1C:
            this.players[actionBlock.playerId].trackGameEntity(0x1C)
            break
          case 0x1D:
            this.players[actionBlock.playerId].trackGameEntity(0x14)
            break
          case 0x1E:

            this.players[actionBlock.playerId].trackGameEntity(0x14)
            break
          case 0x61:

            break
          case 0x65:

            break
          case 0x6b:
            this.w3mmd.push(action.data)
            break
          case 0x66:

            break
          case 0x67:

            break
        }
        if (isAPMAction === true) {
          this.playerActions[actionBlock.playerId]++
          this.temporaryAPMTracker.current[actionBlock.playerId] = this.temporaryAPMTracker.current[actionBlock.playerId] + 1
        }
      })
    } catch (ex) {
      console.log(ex,'could not parse this action block.')
    }
  })
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

module.exports = W3GReplay
