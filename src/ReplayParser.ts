import { Parser } from 'binary-parser'
import { ActionBlockList } from './parsers/actions'
import { ReplayHeader, EncodedMapMetaString, GameMetaData } from './parsers/header'
import { GameDataParser } from './parsers/gamedata'

// Cannot import node modules directly because error with rollup
// https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
const { readFileSync, appendFileSync } = require('fs')
const { inflateSync, constants } = require('zlib')
const { createHash } = require('crypto')
const GameDataParserComposed = new Parser()
  .nest('meta', { type: GameMetaData })
  .nest('blocks', { type: GameDataParser })
const EventEmitter = require('events')

class ReplayParser extends EventEmitter{
  filename: string
  buffer: Buffer

  constructor() {
    super()
    this.buffer = Buffer.from('')
    this.filename= ''
  }

  parse($buffer: string) {
    console.time('parse')
    this.buffer = readFileSync($buffer)
    this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))
    this.filename = $buffer
    const decompressed: Buffer[] = []

    this._parseHeader()

    this.header.blocks.forEach((block: any ) => {
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
    const meta = { ...this.gameMetaDataDecoded, ...this.gameMetaDataDecoded.meta, ...EncodedMapMetaString.parse(decodedMetaStringBuffer) }
    let newMeta = meta
    delete newMeta.meta    
    this.emit('gamemetadata', newMeta)
    this._parseGameDataBlocks()
    console.timeEnd('parse')
  }

  _parseHeader(){
    this.header = ReplayHeader.parse(this.buffer)
  }

  _parseGameDataBlocks(){
    this.gameMetaDataDecoded.blocks.forEach((block: any) => {
        this.emit('gamedatablock', block)
        this._processGameDataBlock(block)
    })
  }

  _processGameDataBlock(block: any) {
      switch (block.type) {
        case 31:
        case 30:
          this.emit('timeslotblock', block)
          this._processTimeSlot(block)
          break
      }
  }

  _processTimeSlot(timeSlotBlock: any): void {
    timeSlotBlock.actions.forEach((actionBlock: any): void => {
      this._processCommandDataBlock(actionBlock)
      this.emit('commandblock', actionBlock)
    })
  }

  _processCommandDataBlock(actionBlock: any) {
    try {
      ActionBlockList.parse(actionBlock.actions).forEach((action: any): void => {
        this.emit('actionblock', action, actionBlock.playerId)
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
}

export default ReplayParser
