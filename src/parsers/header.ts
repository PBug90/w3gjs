import { Parser } from "binary-parser";
import { raceFlagFormatter } from "./formatters";

const Header = new Parser()
  .string("magic", { zeroTerminated: true })
  .int32le("offset")
  .int32le("compressedSize")
  .string("headerVersion", { encoding: "hex", length: 4 })
  .int32le("decompressedSize")
  .int32le("compressedDataBlockCount");

const SubHeaderV1 = new Parser()
  .string("gameIdentifier", { length: 4 })
  .int32le("version")
  .int16le("buildNo")
  .string("flags", { encoding: "hex", length: 2 })
  .int32le("replayLengthMS")
  .uint32le("checksum");

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
  .uint16le("blockSize")
  .uint16le("blockDecompressedSize")
  .string("unknown", { encoding: "hex", length: 4 })
  .buffer("compressed", { length: "blockSize" });

const DataBlock = new Parser()
  .uint16le("blockSize")
  .skip(2)
  .uint16le("blockDecompressedSize")
  .string("unknown", { encoding: "hex", length: 4 })
  .skip(2)
  .buffer("compressed", { length: "blockSize" });

const DataBlocksVanilla = new Parser().array("blocks", {
  type: DataBlockVanilla,
  readUntil: "eof",
});

const DataBlocksReforged = new Parser().array("blocks", {
  type: DataBlock,
  readUntil: "eof",
});

const ReplayHeader = new Parser()
  .nest("header", {
    type: Header,
  })
  .nest("subheader", { type: SubHeaderV1 })
  .choice("blocks", {
    tag: function () {
      //@ts-ignore
      return this.subheader.buildNo < 6089 ? 1 : 0;
    },
    choices: {
      1: DataBlocksVanilla,
    },
    defaultChoice: DataBlocksReforged,
  });

const PlayerRecordLadder = new Parser()
  .string("runtimeMS", { encoding: "hex", length: 4 })
  .int32le("raceFlags", { formatter: raceFlagFormatter });

const HostRecord = new Parser()
  .int8("playerId")
  .string("playerName", { zeroTerminated: true })
  .uint8("addDataFlagHost")
  .choice("additional", {
    tag: "addDataFlagHost",
    choices: {
      8: PlayerRecordLadder,
      0: new Parser().skip(0),
      1: new Parser().skip(1),
      2: new Parser().skip(2),
    },
  });

const PlayerRecord = new Parser()
  .int8("playerId")
  .string("playerName", { zeroTerminated: true })
  .uint8("addDataFlag")
  .choice("additional", {
    tag: "addDataFlag",
    choices: {
      1: new Parser().skip(1),
      8: PlayerRecordLadder,
      2: new Parser().skip(2),
      0: new Parser().skip(0),
    },
  });

const PlayerRecordInList = new Parser()
  .nest("", { type: PlayerRecord })
  .skip(4);

const PlayerSlotRecord = new Parser()
  .int8("playerId")
  .skip(1) // mapDownloadPercent
  .int8("slotStatus")
  .int8("computerFlag")
  .int8("teamId")
  .int8("color")
  .int8("raceFlag", { formatter: raceFlagFormatter })
  .int8("aiStrength")
  .int8("handicapFlag");

const GameMetaData = new Parser()
  .skip(5)
  .nest("player", { type: HostRecord })
  .string("gameName", { zeroTerminated: true })
  .string("privateString", { zeroTerminated: true })
  .string("encodedString", { zeroTerminated: true, encoding: "hex" })
  .int32le("playerCount")
  .string("gameType", { length: 4, encoding: "hex" })
  .string("languageId", { length: 4, encoding: "hex" })
  .array("playerList", {
    type: new Parser()
      .int8("hasRecord")
      // @ts-ignore
      .choice(null, {
        tag: "hasRecord",
        choices: {
          22: PlayerRecordInList,
          25: new Parser().skip(-1),
        },
      }),
    readUntil(item, buffer) {
      // @ts-ignore
      const next = buffer.readInt8();
      return next === 57 || next === 25;
    },
  })
  .int8("checkGameStartRecord")
  .choice("", {
    tag: "checkGameStartRecord",
    defaultChoice: new Parser()
      .skip(-1)
      .buffer("test", { length: 6 })
      .buffer("test2", { length: 6 })
      .array("extraPlayerList", {
        type: new Parser()
          .int8("preVars1")
          .int8("recordLength")
          // @ts-ignore
          .saveOffset("recordParseStartOffset")
          .int8("unknown1")
          .int8("playerId")
          .int8("unknown2")
          .int8("nameLength")
          .string("name", { length: "nameLength" })
          .skip(1)
          .int8("clanLength")
          .string("clan", { length: "clanLength" })
          .skip(1)
          .int8("extraLength")
          .buffer("extra", { length: "extraLength" })
          .saveOffset("recordParseEndOffset")
          .seek(function () {
            return (
              // @ts-ignore
              this.recordLength -
              // @ts-ignore
              (this.recordParseEndOffset - this.recordParseStartOffset)
            );
          }),
        readUntil(item, buffer) {
          // @ts-ignore
          this.attempts = this.attempts === undefined ? 0 : this.attempts + 1;
          // @ts-ignore
          const next = buffer.readInt8();
          // @ts-ignore
          if (this.attempts > 30) {
            throw new Error("Could not parse extraPlayerList.");
          }
          return next === 25;
        },
      }),
    choices: {
      25: new Parser().skip(-1),
    },
  })
  .int8("gameStartRecord")
  .int16("dataByteCount")
  .int8("slotRecordCount")
  .array("playerSlotRecords", {
    type: PlayerSlotRecord,
    length: "slotRecordCount",
  })
  .int32le("randomSeed")
  .string("selectMode", { length: 1, encoding: "hex" })
  .int8("startSpotCount");

const EncodedMapMetaString = new Parser()
  .uint8("speed")
  .bit1("hideTerrain")
  .bit1("mapExplored")
  .bit1("alwaysVisible")
  .bit1("default")
  .bit2("observerMode")
  .bit1("teamsTogether")
  .bit2("empty")
  .bit2("fixedTeams")
  .bit5("empty")
  .bit1("fullSharedUnitControl")
  .bit1("randomHero")
  .bit1("randomRaces")
  .bit3("empty")
  .bit1("referees")
  .skip(5)
  .string("mapChecksum", { length: 4, encoding: "hex" })
  .string("mapName", { zeroTerminated: true })
  .string("creator", { zeroTerminated: true });

export type ReplayHeaderType = ReturnType<typeof ReplayHeader.parse>;
export type GameMetaDataDecodedType = ReturnType<typeof GameMetaData.parse>;
export type SlotRecordType = ReturnType<typeof PlayerSlotRecord.parse>;

export type DataBlocksReforgedType = ReturnType<
  typeof DataBlocksReforged.parse
>;
export type DataBlocksType = ReturnType<typeof DataBlocksVanilla.parse>;

export { ReplayHeader, EncodedMapMetaString, GameMetaData, DataBlock };
