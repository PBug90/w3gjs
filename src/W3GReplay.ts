import { ActionBlockList } from './parsers/actions'
import Player from './Player'
import convert from './convert'
import ReplayParser from './ReplayParser'
import { Races } from './types'

// Cannot import node modules directly because error with rollup
// https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
const { createHash } = require('crypto')

interface gameMetaDataDecoded {
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
    playerList: gameMetaDataDecoded['meta']['player'][]
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

class W3GReplay extends ReplayParser{
  players: { [key: string]: Player } = {}
  
  constructor() {
    super()
    this.on('gamemetadata', (metaData: any ) => this.handleMetaData(metaData))
    this.on('gamedatablock', (timeslotblock: any ) => this.processGameDataBlock(timeslotblock)) 
    this.on('timeslotblock', (timeslotblock: any ) => this.handleTimeSlot(timeslotblock))        
  }

  // gamedatablock timeslotblock commandblock actionblock
  parse($buffer: string): W3GReplay['final'] {
    this.buffer = Buffer.from('')
    this.filename= ''
    this.id = ''
    this.chatlog = []
    this.leaveEvents = []
    this.w3mmd = []   
    this.players = {}
    this.totalTimeTracker = 0
    this.timeSegmentTracker = 0
    this.playerActionTrackInterval = 60000

    super.parse($buffer)

    this.chatlog = this.chatlog.map((elem: any) => {
      return ({ ...elem, playerName: this.players[elem.playerId].name })
    })

    this.generateID()
    this.determineMatchup()
    this.cleanup()

    return this.finalize()
  }

  handleMetaData(metaData: any) {
    this.slots = metaData.playerSlotRecords
    this.playerList = [metaData.player, ...metaData.playerList]
    this.meta = metaData
    const tempPlayers: {[key: string]: gameMetaDataDecoded["meta"]["player"]   } = {}
    this.teams = {}
    this.players = {}

    this.playerList.forEach((player: gameMetaDataDecoded["meta"]["player"]): void => {
      tempPlayers[player.playerId] = player
    })

    this.slots.forEach((slot: any) => {
      if (slot.slotStatus > 1) {
        this.teams[slot.teamId] = this.teams[slot.teamId] || []
        this.teams[slot.teamId].push(slot.playerId)
    
        this.players[slot.playerId] = new Player(slot.playerId, tempPlayers[slot.playerId]
          ? tempPlayers[slot.playerId].playerName
          : 'Computer', slot.teamId, slot.color, slot.raceFlag)
      }
    })
  }

  processGameDataBlock(block: any) {
      switch (block.type) {
        case 31:
        case 30:
          this.totalTimeTracker += block.timeIncrement
          this.timeSegmentTracker += block.timeIncrement
          if (this.timeSegmentTracker > this.playerActionTrackInterval) {
            //@ts-ignore
            Object.values(this.players).forEach(p => p.newActionTrackingSegment())
            this.timeSegmentTracker = 0
          }
          break
        case 32:
          block.timeMS = this.totalTimeTracker
          this.chatlog.push(block)
          break
        case 23:
          this.leaveEvents.push(block)
          break
      }
  }

  handleTimeSlot(timeSlotBlock: any): void {
    timeSlotBlock.actions.forEach((actionBlock: any): void => {
      this.processCommandDataBlock(actionBlock)
    })
  }

  processCommandDataBlock(actionBlock: any) {
    const currentPlayer = this.players[actionBlock.playerId]
    currentPlayer.currentTimePlayed = this.totalTimeTracker
    currentPlayer._lastActionWasDeselect = false
    try {
      ActionBlockList.parse(actionBlock.actions).forEach((action: any): void => {
        this.handleActionBlock(action, currentPlayer)
      })
    } catch (ex) {
      console.error(ex)
    }
  }

  handleActionBlock(action: any, currentPlayer: Player){
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
          currentPlayer._lastActionWasDeselect = true
          currentPlayer.handle0x16(action.selectMode, true)
        } else {
          if (currentPlayer._lastActionWasDeselect === false) {
            currentPlayer.handle0x16(action.selectMode, true)
          }
          currentPlayer._lastActionWasDeselect = false
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
  
    const idBase = this.meta.randomSeed + players + this.meta.mapName
    this.id = createHash('sha256').update(idBase).digest('hex')
  }

  cleanup(): void {
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
  }

  finalize(): W3GReplay['final'] {1
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
      gamename: this.meta.gameName,
      randomseed: this.meta.randomSeed,
      startSpots: this.meta.startSpotCount,
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
