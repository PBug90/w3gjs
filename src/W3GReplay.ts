import { Parser } from 'binary-parser'
import { ActionBlockList } from './parsers/actions'
import { ReplayHeader, EncodedMapMetaString, GameMetaData } from './parsers/header'
import { GameDataParser } from './parsers/gamedata'
import { Races } from './types'
import Player from './Player'
import convert from './convert'
import { chatModeFormatter } from './parsers/formatters';

// Cannot import node modules directly because error with rollup
// https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
const { readFileSync } = require('fs')
const { inflateSync, constants } = require('zlib')
const { createHash } = require('crypto')

const GameDataParserComposed = new Parser()
  .nest('meta', { type: GameMetaData })
  .nest('blocks', { type: GameDataParser })

class W3GReplay {
  buffer: Buffer
  id: string
  header: {
    magic: string
    offset: number
    compressedSize: number
    headerVersion: string
    decompressedSize: number
    compressedDataBlockCount: number
    gameIdentifier: string
    version: number
    buildNo: number
    flags: string
    replayLengthMS: number
    checksum: number
    blocks: {
      blockSize: number
      blockDecompressedSize: number
      unknown: string
      compressed: Buffer
    }[]
  }
  decompressed: Buffer
  gameMetaDataDecoded: {
    meta: {
      player: {
        hasRecord?: number
        playerId: number
        playerName: string
        addDataFlag?: number
        addDataFlagHost?: number
        additional: {
          runtimeMs?: string
          raceFlags?: Races
        }
      }
      gameName: string
      encodedString: string
      playerCount: number
      gameType: string
      languageId: string
      playerList: W3GReplay['gameMetaDataDecoded']['meta']['player'][]
      gameStartRecord: number
      dataByteCount: number
      slotRecordCount: number
      playerSlotRecords: {
        playerId: number
        slotStatus: number
        cumputerFlag: number
        teamId: number
        color: number
        raceFlag: Races
        aiStrength: number
        handicapFlag: number 
      }[]
      randomSeed: number
      selectMode: string
      startSpotCount: number
    }
    blocks: {
      type: number
      [key: string]: any
    }[]
  }
  meta: {
    meta: W3GReplay['gameMetaDataDecoded']['meta']
    speed: number
    hideTerrain: number
    mapExplored: number
    alwaysVisible: number
    default: number
    observerMode: number
    teamsTogether: number
    empty: number
    fixedTeams: number
    fullSharedUnitControl: number
    randomHero: number
    randomRaces: number
    referees: number
    mapChecksum: string
    mapName: string
    creator: string
    blocks: W3GReplay['gameMetaDataDecoded']['blocks']
  }
  slots: W3GReplay['gameMetaDataDecoded']['meta']['playerSlotRecords']
  playerList: W3GReplay['gameMetaDataDecoded']['meta']['playerList']
  playerActionTrackInterval: number
  teams: { [key: string]: number[] }
  players: { [key: string]: Player }
  chatlog: {
    type: number
    playerId: number
    flags: number
    chatModel: string
    message: string
    time: number
    playerName: string
  }[]
  leaveEvents: {
    type: number
    reason: string
    playerId: number
    result: string
  }[]
  w3mmd: {
    actionId: number
    filename: string
    missionKey: string
    key: string
    value: number
  }[]
  totalTimeTracker: number
  timeSegmentTracker: number
  gametype: string
  matchup: string
  observers: string[]
  apmTimeSeries: any
  temporaryAPMTracker: any

  final: {
    id: W3GReplay['id']
    gamename: W3GReplay['meta']['meta']['gameName']
    randomseed: W3GReplay['meta']['meta']['randomSeed']
    startSpots: W3GReplay['meta']['meta']['startSpotCount']
    observers: W3GReplay['observers']
    players: Player[]
    matchup: W3GReplay['matchup']
    creator: W3GReplay['meta']['creator']
    type: W3GReplay['gametype']
    chat: any[]
    apm: {
      trackingInterval: W3GReplay['playerActionTrackInterval']
    }
    map: {
      path: W3GReplay['meta']['mapName']
      file: string
      checksum: W3GReplay['meta']['mapChecksum']
    }
    version: string
    duration: W3GReplay['header']['replayLengthMS']
    expansion: boolean
    settings: {
      referees: boolean
      fixedTeams: boolean
      fullSharedUnitControl: boolean
      alwaysVisible: boolean
      hideTerrain: boolean
      mapExplored: boolean
      teamsTogether: boolean
      randomHero: boolean
      randomRaces: boolean
      speed: W3GReplay['meta']['speed']
    }
  }

  constructor() {
    this.buffer = Buffer.from('')
    this.id = ''
    this.header = {
      magic: '',
      offset: 0,
      compressedSize: 0,
      headerVersion: '',
      decompressedSize: 0,
      compressedDataBlockCount: 0,
      gameIdentifier: '',
      version: 0,
      buildNo: 0,
      flags: '',
      replayLengthMS: 0,
      checksum: 0,
      blocks: []
    }
    this.gameMetaDataDecoded = {
      meta: {
        player: {
          playerId: 0,
          playerName: '',
          addDataFlagHost: 0,
          additional: {}
        },
        gameName: '',
        encodedString: '',
        playerCount: 0,
        gameType: '',
        languageId: '',
        playerList: [],
        gameStartRecord: 0,
        dataByteCount: 0,
        slotRecordCount: 0,
        playerSlotRecords: [],
        randomSeed: 0,
        selectMode: '',
        startSpotCount: 0,
      },
      blocks: [],
    }
    this.meta = {
      ...this.gameMetaDataDecoded,
      speed: 0,
      hideTerrain: 0,
      mapExplored: 0,
      alwaysVisible: 0,
      default: 0,
      observerMode: 0,
      teamsTogether: 0,
      empty: 0,
      fixedTeams: 0,
      fullSharedUnitControl: 0,
      randomHero: 0,
      randomRaces: 0,
      referees: 0,
      mapChecksum: '',
      mapName: '',
      creator: '',
    }
    this.players = {}
    this.chatlog = []
    this.leaveEvents = []
    this.decompressed = Buffer.from('')
    this.slots = []
    this.playerList = []
    this.teams = {}
    this.totalTimeTracker = 0
    this.timeSegmentTracker = 0
    this.gametype = ''
    this.matchup = ''
    this.observers = []
    this.w3mmd = []
    // apm tracking interval in milliseconds
    this.playerActionTrackInterval = 60000

    this.final = {
      id: '',
      gamename: '',
      randomseed: 0,
      startSpots: 0,
      observers: [],
      players: [],
      matchup: '',
      creator: '',
      type: '',
      chat: [],
      apm: {
        trackingInterval: 0,
      },
      map: {
        path: '',
        file: '',
        checksum: '',
      },
      version: '',
      duration: 0,
      expansion: false,
      settings: {
        referees: false,
        fixedTeams: false,
        fullSharedUnitControl: false,
        alwaysVisible: false,
        hideTerrain: false,
        mapExplored: false,
        teamsTogether: false,
        randomHero: false,
        randomRaces: false,
        speed: 0
      }
    }
  }

  parse($buffer: Buffer): W3GReplay['final'] {
    console.time('parse')
    this.buffer = readFileSync($buffer)
    this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))

    this.header = ReplayHeader.parse(this.buffer)
    const decompressed: Buffer[] = []
    this.header.blocks.forEach(block => {
      if (block.blockSize > 0 && block.blockDecompressedSize === 8192) {
        try {
          const r = inflateSync(block.compressed, { finishFlush: constants.Z_SYNC_FLUSH })
          if (r.byteLength > 0 && block.compressed.byteLength > 0) {
            decompressed.push(r)
          }
        } catch (ex) {
          console.log(ex)
        }
      }
    })
    this.decompressed = Buffer.concat(decompressed)

    // @ts-ignore
    this.gameMetaDataDecoded = GameDataParserComposed.parse(this.decompressed)

    const decodedMetaStringBuffer = this.decodeGameMetaString(this.gameMetaDataDecoded.meta.encodedString)
    this.meta = { ...this.gameMetaDataDecoded, ...EncodedMapMetaString.parse(decodedMetaStringBuffer) }

    this.slots = this.gameMetaDataDecoded.meta.playerSlotRecords
    this.playerList = [this.gameMetaDataDecoded.meta.player, ...this.gameMetaDataDecoded.meta.playerList]

    this.createPlayerList()
    this.processGameDataBlocks()
    this.cleanup()

    console.timeEnd('parse')
    return this.finalize()
  }

  createPlayerList() {
    const tempPlayers: { [key: string]: W3GReplay['gameMetaDataDecoded']['meta']['player'] } = {}
    this.teams = {}
    this.players = {}

    this.playerList.forEach((player): void => {
      tempPlayers[player.playerId] = player
    })

    this.slots.forEach(slot => {
      if (slot.slotStatus > 1) {
        this.teams[slot.teamId] = this.teams[slot.teamId] || []
        this.teams[slot.teamId].push(slot.playerId)
        this.players[slot.playerId] = new Player(slot.playerId, tempPlayers[slot.playerId]
          ? tempPlayers[slot.playerId].playerName
          : 'Computer', slot.teamId, slot.color, slot.raceFlag)
      }
    })
  }

  processGameDataBlocks() {
    this.chatlog = []
    this.leaveEvents = []
    this.w3mmd = []

    this.totalTimeTracker = 0
    this.timeSegmentTracker = 0
    this.gameMetaDataDecoded.blocks.forEach((block: any) => {
      switch (block.type) {
        case 31:
        case 30:
          this.totalTimeTracker += block.timeIncrement
          this.timeSegmentTracker += block.timeIncrement
          if (this.timeSegmentTracker > this.playerActionTrackInterval) {
            Object.values(this.players).forEach(p => p.newActionTrackingSegment())
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

    this.chatlog = this.chatlog.map(elem => ({ ...elem, playerName: this.players[elem.playerId].name }))
    delete this.temporaryAPMTracker
  }

  processTimeSlot(timeSlotBlock: any): void {
    timeSlotBlock.actions.forEach((actionBlock: any): void => {
      this.processCommandDataBlock(actionBlock)
    })
  }

  processCommandDataBlock(actionBlock: any) {
    const currentPlayer = this.players[actionBlock.playerId]
    let lastActionWasDeselect = false
    currentPlayer.currentTimePlayed = this.totalTimeTracker
    try {
      ActionBlockList.parse(actionBlock.actions).forEach((action: any): void => {
        switch (action.actionId) {
          case 0x10:
            currentPlayer.handle0x10(action.itemId, this.totalTimeTracker)
            break
          case 0x11:
            currentPlayer.handle0x11(action.itemId, this.totalTimeTracker)
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

  decodeGameMetaString(str: string): Buffer {
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

  isObserver(player: Player): boolean {
    return (player.teamid === 24 && this.header.version >= 29) || (player.teamid === 12 && this.header.version < 29)
  }

  determineMatchup(): void {
    let teamRaces: { [key: string]: string[] } = {}
    Object.values(this.players).forEach(p => {
      if (!this.isObserver(p)) {
        teamRaces[p.teamid] = teamRaces[p.teamid] || []
        teamRaces[p.teamid].push(p.raceDetected || p.race)
      }
    })
    this.gametype = Object.values(teamRaces).map(e => e.length).sort().join('on')
    this.matchup = Object.values(teamRaces).map(e => e.sort().join('')).sort().join('v')
  }

  generateID(): void {
    let players = Object.values(this.players).filter((p) => this.isObserver(p) === false).sort((player1, player2) => {
      if (player1.id < player2.id) {
        return -1
      }
      return 1
    }).reduce((accumulator, player) => {
      accumulator += player.name
      return accumulator
    }, '')
  
    const idBase = this.meta.meta.randomSeed + players + this.meta.mapName
    this.id = createHash('sha256').update(idBase).digest('hex')
  }

  cleanup(): void {
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
    delete this.header.blocks
    delete this.apmTimeSeries
    delete this.meta.blocks
  }

  finalize(): W3GReplay['final'] {
    const settings = {
      referees: !!this.meta.referees,
      fixedTeams: !!this.meta.fixedTeams,
      fullSharedUnitControl: !!this.meta.fullSharedUnitControl,
      alwaysVisible: !!this.meta.alwaysVisible,
      hideTerrain: !!this.meta.hideTerrain,
      mapExplored: !!this.meta.mapExplored,
      teamsTogether: !!this.meta.teamsTogether,
      randomHero: !!this.meta.randomHero,
      randomRaces: !!this.meta.randomRaces,
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
        file: this.meta.mapName.split('\\').pop() || '',
        checksum: this.meta.mapChecksum
      },
      version: convert.gameVersion(this.header.version),
      duration: this.header.replayLengthMS,
      expansion: this.header.gameIdentifier === 'PX3W',
      settings
    }
  
    return root
  }
}

export default W3GReplay
