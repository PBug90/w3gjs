import { readFileSync } from 'fs';
import { inflateSync, constants } from 'zlib';
import { Parser } from 'binary-parser'
import { ActionBlockList } from './parsers/actions'
import { ReplayHeader, EncodedMapMetaString, GameMetaData } from './parsers/header'
import { GameDataParser } from './parsers/gamedata'

const GameDataParserComposed = new Parser()
  .nest('meta', { type: GameMetaData })
  .nest('blocks', { type: GameDataParser })

import Player from './Player'

class W3GReplay {
  private buffer: Buffer;
  private header: {
    magic: string;
    offset: number;
    compressedSize: number;
    headerVersion: string;
    decompressedSize: number;
    compressedDataBlockCount: number;
    gameIdentifier: string;
    version: number;
    buildNo: number;
    flags: string;
    replayLengthMS: number;
    checksum: number;
    blocks: any[];
  }
  private decompressed: Buffer;
  private gameMetaDataDecoded: any;
  private temporaryAPMTracker: any;
  private decodedMetaStringBuffer: any;
  private meta: any;
  private slots: any;
  private playerList: any;
  private playerActionTrackInterval: any;
  private teams: { [key: string]: number[] };
  private players: { [key: string]: Player };
  private chatlog: any;
  private leaveEvents: any;
  private w3mmd: any;
  private totalTimeTracker: number;
  private timeSegmentTracker: number;
  private matchup: string;
  private observers: string[];
  private apmTimeSeries: any;


  constructor($buffer: string) {
    this.buffer = readFileSync($buffer)
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
    this.players = {}
    this.decompressed = new Buffer('')
    this.teams = {}
    this.totalTimeTracker = 0
    this.timeSegmentTracker = 0
    this.matchup = ''
    this.observers = []
  }

  parse(): this {
    console.time('parse')
    this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))

    this.header = ReplayHeader.parse(this.buffer)
    const decompressed: Buffer[] = []
    this.header.blocks.forEach((block: any) => {
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
    this.gameMetaDataDecoded = GameDataParserComposed.parse(this.decompressed)

    this.decodedMetaStringBuffer = this.decodeGameMetaString(this.gameMetaDataDecoded.meta.encodedString)
    this.meta = { ...this.gameMetaDataDecoded, ...EncodedMapMetaString.parse(this.decodedMetaStringBuffer) }

    this.slots = this.gameMetaDataDecoded.meta.playerSlotRecords
    this.playerList = [this.gameMetaDataDecoded.meta.player, ...this.gameMetaDataDecoded.meta.playerList]

    this.playerActionTrackInterval = 60000 // apm tracking interval in milliseconds

    this.createPlayerList()
    this.processGameDataBlocks()
    this.cleanup()

    console.timeEnd('parse')
    // @ts-ignore
    return { ...this }
  }

  createPlayerList() {
    const tempPlayers: { [key: string]: any } = {}
    this.teams = {}
    this.players = {}

    this.playerList.forEach((player: any): void => {
      tempPlayers[player.playerId] = player
    })

    this.slots.forEach((slot: any) => {
      if (slot.slotStatus > 1) {
        this.players[slot.playerId] = { ...this.players[slot.playerId], ...slot }
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
            Object.values(this.players).forEach((p: any) => p.newActionTrackingSegment())
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

    this.chatlog = this.chatlog.map((elem: any) => ({ ...elem, playerName: this.players[elem.playerId].name }))
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

  isObserver(player: any): boolean {
    return (player.teamid === 24 && this.header.version >= 29) || (player.teamid === 12 && this.header.version < 29)
  }

  determineMatchup(): void {
    let teamRaces: { [key: string]: any } = {}
    Object.values(this.players).forEach((p: any) => {
      if (!this.isObserver(p)) {
        teamRaces[p.teamid] = teamRaces[p.teamid] || []
        teamRaces[p.teamid].push(p.detectedRace || p.race)
      }
    })
    this.matchup = (Object.values(teamRaces).map((e: any) => e.sort().join(''))).sort().join('v')
  }

  cleanup(): void {
    this.determineMatchup()
    this.observers = []

    Object.values(this.players).forEach((p: any) => {
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
}

export default W3GReplay
