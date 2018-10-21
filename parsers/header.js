const { Parser } = require('binary-parser')
const {raceFlagFormatter} = require('./formatters')

const Header = new Parser()
  .string('magic', {zeroTerminated: true})
  .int32le('offset')
  .int32le('compressedSize')
  .string('headerVersion', {encoding: 'hex', length: 4})
  .int32le('decompressedSize')
  .int32le('compressedDataBlockCount')

const SubHeaderV1 = new Parser()
  .string('gameIdentifier', {length: 4})
  .int32le('version')
  .int16le('buildNo')
  .string('flags', {encoding: 'hex', length: 2})
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

const DataBlock = new Parser()
  .int16le('blockSize')
  .int16le('blockDecompressedSize')
  .string('unknown', {encoding: 'hex', length: 4})
  .buffer('compressed', {length: 'blockSize'})

const DataBlocks = new Parser()
  .array('blocks', {type: DataBlock, readUntil: 'eof'})

const ReplayHeader = new Parser()
  .nest(null, {
    type: Header
  })
  .nest(null, { type: SubHeaderV1 })
  .nest(null, { type: DataBlocks })

const PlayerRecordLadder = new Parser()
  .string('runtimeMS', {encoding: 'hex', length: 4})
  .int32le('raceFlags', { formatter: raceFlagFormatter })

const PlayerRecord = new Parser()
  .int8('playerId')
  .string('playerName', {zeroTerminated: true})
  .uint8('addDataFlag')
  .choice('additional', {tag: 'addDataFlag',
    choices: {
      1: new Parser().skip(1),
      8: PlayerRecordLadder,
      2: new Parser().skip(2)
    }})

const PlayerRecordInList = new Parser()
  .nest(null, {type: PlayerRecord})
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
  .skip(4)
  .skip(1)
  .nest('player', {type: PlayerRecord})
  .string('gameName', {zeroTerminated: true})
  .skip(1)
  .string('encodedString', {zeroTerminated: true, encoding: 'hex'})
  .int32le('playerCount')
  .string('gameType', {length: 4, encoding: 'hex'})
  .string('languageId', {length: 4, encoding: 'hex'})
  .array('playerList', {
    type: new Parser()
      .int8('hasRecord')
      .choice(null, {tag: 'hasRecord',
        choices: {
          0: new Parser(),
          22: PlayerRecordInList
        },
        defaultChoice: new Parser()
      }),
    readUntil: function (item, buffer) {
      const next = buffer.readInt8()
      return (next !== 22 && next !== 25) || item.hasRecord === 25
    },
    formatter: (input) => {
      input.splice(-1, 1)
      return input
    }
  })
  .int16('dataByteCount')
  .int8('slotRecordCount')
  .array('playerSlotRecords', {type: PlayerSlotRecord, length: 'slotRecordCount'})
  .int32le('randomSeed')
  .string('selectMode', {length: 1, encoding: 'hex'})
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
  .string('mapChecksum', {length: 4, encoding: 'hex'})
  .string('mapName', {zeroTerminated: true})
  .string('creator', {zeroTerminated: true})

module.exports = {
  ReplayHeader,
  EncodedMapMetaString,
  GameMetaData
}
