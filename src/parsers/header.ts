import { Parser } from 'binary-parser'
import { raceFlagFormatter } from './formatters'
import { Platform } from '../types'

const Header = new Parser()
    .string('magic', { zeroTerminated: true })
    .int32le('offset')
    .int32le('compressedSize')
    .string('headerVersion', { encoding: 'hex', length: 4 })
    .int32le('decompressedSize')
    .int32le('compressedDataBlockCount')

const SubHeaderV1 = new Parser()
    .string('gameIdentifier', { length: 4 })
    .int32le('version')
    .int16le('buildNo')
    .string('flags', { encoding: 'hex', length: 2 })
    .int32le('replayLengthMS')
    .uint32le('checksum')

/*
const SubHeaderV0 = new Parser()
  .string('unknown', {length: 4})
  .int16le('version')
  .int16le('buildNo')
  .string('flags', {encoding: 'hex', length: 2})
  .int32le('replayLengthMS')
  .int32le('checksum')
*/

const DataBlockVanilla = new Parser()
    .uint16le('blockSize')
    .uint16le('blockDecompressedSize')
    .string('unknown', { encoding: 'hex', length: 4 })
    .buffer('compressed', { length: 'blockSize' })

const DataBlock = new Parser()
    .uint16le('blockSize')
    .skip(2)
    .uint16le('blockDecompressedSize')
    .string('unknown', { encoding: 'hex', length: 4 })
    .skip(2)
    .buffer('compressed', { length: 'blockSize' })

const DataBlocksVanilla = new Parser()
    .array('blocks', { type: DataBlockVanilla, readUntil: 'eof' })

const DataBlocksReforged = new Parser()
    .array('blocks', { type: DataBlock, readUntil: 'eof' })

const ReplayHeader = new Parser()
// @ts-ignore
    .nest(null, {
        type: Header
    })
    .nest(null, { type: SubHeaderV1 })
    .choice(null, {
        tag: function () {
            return this.buildNo < 6089 ? 1 : 0
        },
        choices: {
            1: DataBlocksVanilla
        },
        defaultChoice: DataBlocksReforged
    })

const PlayerRecordLadder = new Parser()
    .string('runtimeMS', { encoding: 'hex', length: 4 })
    .int32le('raceFlags', { formatter: raceFlagFormatter })

const HostRecord = new Parser()
    .int8('playerId')
    .string('playerName', { zeroTerminated: true })
    .uint8('addDataFlagHost')
    .choice('additional', {
        tag: 'addDataFlagHost',
        choices: {
            8: PlayerRecordLadder,
            0: new Parser().skip(0),
            1: new Parser().skip(1),
            2: new Parser().skip(2)
        }
    })

const PlayerRecord = new Parser()
    .int8('playerId')
    .string('playerName', { zeroTerminated: true })
    .uint8('addDataFlag')
    .choice('additional', {
        tag: 'addDataFlag',
        choices: {
            1: new Parser().skip(1),
            8: PlayerRecordLadder,
            2: new Parser().skip(2),
            0: new Parser().skip(0)
        }
    })

const PlayerRecordInList = new Parser()
// @ts-ignore
    .nest(null, { type: PlayerRecord })
    .skip(4)

const PlayerSlotRecord = new Parser()
    .int8('playerId')
    .skip(1) // mapDownloadPercent
    .int8('slotStatus')
    .int8('computerFlag')
    .int8('teamId')
    .int8('color')
    .int8('raceFlag', { formatter: raceFlagFormatter })
    .int8('aiStrength')
    .int8('handicapFlag')

const GameMetaData = new Parser()
    .skip(5)
    .nest('player', { type: HostRecord })
    .string('gameName', { zeroTerminated: true })
    .string('privateString', { zeroTerminated: true })
    .string('encodedString', { zeroTerminated: true, encoding: 'hex' })
    .int32le('playerCount')
    .string('gameType', { length: 4, encoding: 'hex' })
    .string('languageId', { length: 4, encoding: 'hex' })
    .array('playerList', {
        type: new Parser()
            .int8('hasRecord')
        // @ts-ignore
            .choice(null, {
                tag: 'hasRecord',
                choices: {
                    22: PlayerRecordInList,
                    25: new Parser().skip(-1)
                }
            }),
        readUntil (item, buffer) {
            // @ts-ignore
            const next = buffer.readInt8()
            return next === 25
        }
    })
    .int8('gameStartRecord')
    .int16('dataByteCount')
    .int8('slotRecordCount')
    .array('playerSlotRecords', { type: PlayerSlotRecord, length: 'slotRecordCount' })
    .int32le('randomSeed')
    .string('selectMode', { length: 1, encoding: 'hex' })
    .int8('startSpotCount')

const GameMetaDataReforged = (buildNo: number) => new Parser()
    .skip(5)
    .nest('player', { type: HostRecord })
    .string('gameName', { zeroTerminated: true })
    .string('privateString', { zeroTerminated: true })
    .string('encodedString', { zeroTerminated: true, encoding: 'hex' })
    .int32le('playerCount')
    .string('gameType', { length: 4, encoding: 'hex' })
    .string('languageId', { length: 4, encoding: 'hex' })
    .array('playerList', {
        type: new Parser()
            .int8('hasRecord')
        // @ts-ignore
            .choice(null, {
                tag: 'hasRecord',
                choices: {
                    22: PlayerRecordInList,
                    25: new Parser().skip(-1)
                }
            }),
        readUntil (item, buffer) {
            // @ts-ignore
            const next = buffer.readInt8()
            return next === 57 || next === 25
        }
    })
    .skip(4) // GamestartRecord etc used to go here
    .skip(8) // More stuff that happens before the next list of players
    .array('extraPlayerList', {
        type: new Parser()
            .int8('preVars1')
            .int8('pre1')
            .int8('pre2')
            .int8('playerId')
            .int8('pre4')
            .int8('nameLength')
            .string('name', { length: 'nameLength' })
            .skip(1)
            .int8('clanLength')
            .string('clan', { length: 'clanLength' })
            .skip(1)
            .int8('extraLength')
            .buffer('extra', { length: 'extraLength' })
            .buffer('post', { length: buildNo >= 6103 ? 4 : 2 }),
        readUntil (item, buffer) {
            // @ts-ignore
            const next = buffer.readInt8()
            return next === 25
        }
    })
    .int8('gameStartRecord')
    .int16('dataByteCount')
    .int8('slotRecordCount')
    .array('playerSlotRecords', { type: PlayerSlotRecord, length: 'slotRecordCount' })
    .int32le('randomSeed')
    .string('selectMode', { length: 1, encoding: 'hex' })
    .int8('startSpotCount')

const EncodedMapMetaString = new Parser()
    .uint8('speed')
    .bit1('hideTerrain')
    .bit1('mapExplored')
    .bit1('alwaysVisible')
    .bit1('default')
    .bit2('observerMode')
    .bit1('teamsTogether')
    .bit2('empty')
    .bit2('fixedTeams')
    .bit5('empty')
    .bit1('fullSharedUnitControl')
    .bit1('randomHero')
    .bit1('randomRaces')
    .bit3('empty')
    .bit1('referees')
    .skip(5)
    .string('mapChecksum', { length: 4, encoding: 'hex' })
    .string('mapName', { zeroTerminated: true })
    .string('creator', { zeroTerminated: true })

const GameMetaDataParserFactory = (buildNo: number, platform: Platform = Platform.BattleNet) => {
    if (platform === 'netease') {
        return GameMetaData
    } else if (buildNo <= 6091) {
        return GameMetaData
    } else {
        return GameMetaDataReforged(buildNo)
    }
}

export {
    ReplayHeader,
    EncodedMapMetaString,
    GameMetaDataParserFactory,
    DataBlock
}
