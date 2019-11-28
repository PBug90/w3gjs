import { Parser } from 'binary-parser'
import { ActionBlockList } from './parsers/actions'
import { ReplayHeader, EncodedMapMetaString, GameMetaData } from './parsers/header'
import { GameDataParser } from './parsers/gamedata'

import {
    TimeSlotBlock,
    CommandDataBlock,
    GameDataBlock,
    ActionBlock,
    CompressedDataBlock
} from './types'

// Cannot import node modules directly because error with rollup
// https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
const { readFileSync } = require('fs')
const { inflateSync, constants } = require('zlib')
const GameDataParserComposed = new Parser()
    .nest('meta', { type: GameMetaData })
    .nest('blocks', { type: GameDataParser })
const EventEmitter = require('events')

class ReplayParser extends EventEmitter {
    filename: string

    buffer: Buffer

    msElapsed = 0

    header: any

    decompressed: Buffer

    gameMetaDataDecoded: any

    constructor () {
        super()
        this.buffer = Buffer.from('')
        this.filename = ''
        this.decompressed = Buffer.from('')
    }

    parse ($buffer: string | Buffer) {
        this.msElapsed = 0
        this.buffer = Buffer.isBuffer($buffer) ? $buffer : readFileSync($buffer)
        this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))
        this.filename = Buffer.isBuffer($buffer) ? 'buffer' : $buffer
        const decompressed: Buffer[] = []

        this._parseHeader()

        this.header.blocks.forEach((block: CompressedDataBlock) => {
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
        const decodedMetaStringBuffer = this.decodeGameMetaString(this.gameMetaDataDecoded.meta.encodedString)
        const meta = { ...this.gameMetaDataDecoded, ...this.gameMetaDataDecoded.meta, ...EncodedMapMetaString.parse(decodedMetaStringBuffer) }
        const newMeta = meta
        delete newMeta.meta
        this.emit('gamemetadata', newMeta)
        this._parseGameDataBlocks()
    }

    _parseHeader () {
        this.header = ReplayHeader.parse(this.buffer)
    }

    _parseGameDataBlocks () {
        this.gameMetaDataDecoded.blocks.forEach((block: GameDataBlock) => {
            this.emit('gamedatablock', block)
            this._processGameDataBlock(block)
        })
    }

    _processGameDataBlock (block: GameDataBlock) {
        switch (block.type) {
            case 31:
            case 30:
                this.msElapsed += block.timeIncrement
                this.emit('timeslotblock', <TimeSlotBlock> <unknown> block)
                this._processTimeSlot(<TimeSlotBlock> <unknown> block)
                break
        }
    }

    _processTimeSlot (timeSlotBlock: TimeSlotBlock): void {
        timeSlotBlock.actions.forEach((block: CommandDataBlock): void => {
            this._processCommandDataBlock(block)
            this.emit('commandblock', block)
        })
    }

    _processCommandDataBlock (actionBlock: CommandDataBlock) {
        try {
            ActionBlockList.parse(actionBlock.actions).forEach((action: ActionBlock): void => {
                this.emit('actionblock', action, actionBlock.playerId)
            })
        } catch (ex) {
            console.error(ex)
        }
    }

    decodeGameMetaString (str: string): Buffer {
        const test = Buffer.from(str, 'hex')
        const decoded = Buffer.alloc(test.length)
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
