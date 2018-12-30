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
const crypto = require('crypto')

function W3GReplay () {
  return this
}

W3GReplay.prototype.parse = function (filepath) {
  console.time('parse')
  this.buffer = fs.readFileSync(filepath)
  this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))

  this.header = ReplayHeader.parse(this.buffer)
  const decompressed = []
  this.header.blocks.forEach((block) => {
    if (block.blockSize > 0 && block.blockDecompressedSize === 8192) {
      try {
        const r = zlib.inflateSync(block.compressed, { finishFlush: zlib.constants.Z_SYNC_FLUSH })
        if (r.byteLength > 0 && block.compressed.byteLength > 0) {
          decompressed.push(r)
        }
      } catch (ex) {
        console.log(ex)
      }
    }
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
  this.cleanup()

  return this.finalize()
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
        new Player(slot.playerId, tempPlayers[slot.playerId] ? tempPlayers[slot.playerId].playerName : 'Computer', slot.teamId, slot.color, slot.raceFlag)
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

  this.chatlog = this.chatlog.map(elem => ({...elem, playerName: this.players[elem.playerId].name}))
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
  currentPlayer.currentTimePlayed = this.totalTimeTracker
  try {
    ActionBlockList.parse(actionBlock.actions).forEach(action => {
      switch (action.actionId) {
        case 0x10:
          currentPlayer.handle0x10(action.itemId, this.totalTimeTracker)
          break
        case 0x11:
          currentPlayer.handle0x11(action.itemId, this.totalTimeTracker)
          break
        case 0x12:
          currentPlayer.handle0x12(action.itemId, this.totalTimeTracker)
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
        case 0x18:
        case 0x1C:
        case 0x1D:
        case 0x1E:
        case 0x61:
        case 0x65:
        case 0x66:
        case 0x67:
          currentPlayer.handleOther(action.actionId)
          break
        case 0x6b:
          this.w3mmd.push(action)
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

W3GReplay.prototype.isObserver = function (player) {
  return (player.teamid === 24 && this.header.version >= 29) || (player.teamid === 12 && this.header.version < 29)
}

W3GReplay.prototype.determineMatchup = function () {
  let teamRaces = {}
  Object.values(this.players).forEach((p) => {
    if (!this.isObserver(p)) {
      teamRaces[p.teamid] = teamRaces[p.teamid] || []
      teamRaces[p.teamid].push(p.raceDetected || p.race)
    }
  })
  this.gametype = Object.values(teamRaces).map(e => e.length).sort().join('on')
  this.matchup = Object.values(teamRaces).map(e => e.sort().join('')).sort().join('v')
}

W3GReplay.prototype.generateID = function () {
  let players = Object.values(this.players).filter((p) => this.isObserver(p) === false).sort((player1, player2) => {
    if (player1.id < player2.id) {
      return -1
    }
    return 1
  }).reduce((accumulator, player) => {
    accumulator += `${player.name}_${player.id}_${player.teamid}`
    return accumulator
  }, '')
  const idBase = this.meta.meta.randomSeed + players + this.meta.mapName
  this.id = crypto.createHash('sha256').update(idBase).digest('hex')
}

W3GReplay.prototype.cleanup = function () {
  this.determineMatchup()
  this.generateID()
  this.observers = []

  Object.values(this.players).forEach(p => {
    p.newActionTrackingSegment(this.playerActionTrackInterval)
    p.cleanup()
    if (this.isObserver(p)) {
      this.observers.push(p.name)
      delete this.players[p.id]
    }
  })

  if (this.header.version >= 29 && this.teams.hasOwnProperty('24')) {
    delete this.teams['24']
  } else if (this.teams.hasOwnProperty('12')) {
    delete this.teams['12']
  }
  delete this.slots
  delete this.playerList
  delete this.buffer
  delete this.decompressed
  delete this.gameMetaDataDecoded
  delete this.decodedMetaStringBuffer
  delete this.header.blocks
  delete this.apmTimeSeries
  delete this.meta.blocks
}

W3GReplay.prototype.finalize = function () {
  const settings = {
    referees: Boolean(this.meta.referees),
    fixedTeams: Boolean(this.meta.fixedTeams),
    fullSharedUnitControl: Boolean(this.meta.fullSharedUnitControl),
    alwaysVisible: Boolean(this.meta.alwaysVisible),
    hideTerrain: Boolean(this.meta.hideTerrain),
    mapExplored: Boolean(this.meta.mapExplored),
    teamsTogether: Boolean(this.meta.teamsTogether),
    randomHero: Boolean(this.meta.randomHero),
    randomRaces: Boolean(this.meta.randomRaces),
    speed: this.meta.speed
  }
  const root = {
    id: this.id,
    gamename: this.meta.meta.gameName,
    randomseed: this.meta.meta.randomSeed,
    startSpots: this.meta.meta.startSpotCount,
    observers: this.observers,
    players: Object.values(this.players).sort((player1, player2) => player2.teamid >= player1.teamid && player2.id > player1.id ? -1 : 1),
    matchup: this.matchup,
    creator: this.meta.creator,
    type: this.gametype,
    chat: [],
    apm: {
      trackingInterval: this.playerActionTrackInterval
    },
    map: {
      path: this.meta.mapName,
      file: this.meta.mapName.split('\\').pop(),
      checksum: this.meta.mapChecksum
    },
    version: `1.${this.header.version}`,
    duration: this.header.replayLengthMS,
    expansion: this.header.gameIdentifier === 'PX3W',
    settings
  }

  return root
}

module.exports = W3GReplay
