import ReplayParser from './ReplayParser'
import { Parser } from 'binary-parser'
import { GameDataParser } from './parsers/gamedata'
import { promisify } from 'util'
import {
    Platform
} from './types'
import { EncodedMapMetaString, GameMetaDataParserFactory } from './parsers/header'
import { readFile } from 'fs'
import { inflate, constants } from 'zlib'

const readFilePromise = promisify(readFile)
const inflatePromise = promisify(inflate)
const setImmediatePromise = promisify(setImmediate)

const GameParserFactory = (buildNo: number, platform: Platform): any => {
    return new Parser()
        .nest('meta', { type: GameMetaDataParserFactory(buildNo, platform) })
        .nest('blocks', { type: GameDataParser })
}

class AsyncReplayParser extends ReplayParser {
    async parse ($buffer: string | Buffer, platform: Platform = Platform.BattleNet): Promise<any> {
        this.msElapsed = 0
        this.buffer = Buffer.isBuffer($buffer) ? $buffer : await readFilePromise($buffer)
        this.buffer = this.buffer.slice(this.buffer.indexOf('Warcraft III recorded game'))
        this.filename = Buffer.isBuffer($buffer) ? 'buffer' : $buffer
        const decompressed: Buffer[] = []

        this._parseHeader()

        for (const block of this.header.blocks) {
            if (block.blockSize > 0 && block.blockDecompressedSize === 8192) {
                try {
                    const r = await inflatePromise(block.compressed, { finishFlush: constants.Z_SYNC_FLUSH })
                    if (r.byteLength > 0 && block.compressed.byteLength > 0) {
                        decompressed.push(r)
                    }
                } catch (ex) {
                    console.log(ex)
                }
            }
        }
        this.decompressed = Buffer.concat(decompressed)

        this.gameMetaDataDecoded = GameParserFactory(this.header.buildNo, platform).parse(this.decompressed)
        const decodedMetaStringBuffer = this.decodeGameMetaString(this.gameMetaDataDecoded.meta.encodedString)
        const meta = { ...this.gameMetaDataDecoded, ...this.gameMetaDataDecoded.meta, ...EncodedMapMetaString.parse(decodedMetaStringBuffer) }
        const newMeta = meta
        delete newMeta.meta
        this.emit('gamemetadata', newMeta)
        await this._parseGameDataBlocks()
    }

    async _parseGameDataBlocks (): Promise<any> {
        for (const block of this.gameMetaDataDecoded.blocks) {
            this.emit('gamedatablock', block)
            this._processGameDataBlock(block)
            await setImmediatePromise()
        }
    }
}

export default AsyncReplayParser
