import { inflate, constants } from "zlib";
import { DataBlock } from "./RawParser";
import StatefulBufferParser from "./StatefulBufferParser";
import { Type, Field } from "protobufjs";

const protoPlayer = new Type("ReforgedPlayerData")
  .add(new Field("playerId", 1, "uint32"))
  .add(new Field("battleTag", 2, "string"))
  .add(new Field("clan", 3, "string"))
  .add(new Field("portrait", 4, "string"))
  .add(new Field("team", 5, "uint32"))
  .add(new Field("unknown", 6, "string"));

const protoSkin = new Type("ReforgedSkinData")
  .add(new Field("playerId", 1, "uint32"))
  .add(new Field("skins", 2, "uint32", "repeated"));

const inflatePromise = (buffer: Buffer, options = {}): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    inflate(buffer, options, (err, result) => {
      if (err !== null) {
        reject(err);
      }
      resolve(result);
    });
  });

export type ReplayMetadata = {
  gameData: Buffer;
  map: MapMetadata;
  playerCount: number;
  gameType: string;
  localeHash: string;
  playerRecords: PlayerRecord[];
  slotRecords: SlotRecord[];
  reforgedPlayerMetadata: ReforgedPlayerMetadata[];
  randomSeed: number;
  selectMode: string;
  gameName: string;
  startSpotCount: number;
};

type PlayerRecord = {
  playerId: number;
  playerName: string;
};

type SlotRecord = {
  playerId: number;
  // 0-100, -1 for bots and embedded maps
  downloadProgress: number;
  slotStatus: number;
  computerFlag: number;
  teamId: number;
  color: number;
  raceFlag: number;
  aiStrength: number;
  handicapFlag: number;
};

type ReforgedPlayerMetadata = {
  playerId: number;
  name: string;
  clan: string;
  skins: number[];
};

type MapMetadata = {
  speed: number;
  hideTerrain: boolean;
  mapExplored: boolean;
  alwaysVisible: boolean;
  default: boolean;
  observerMode: number;
  teamsTogether: boolean;
  fixedTeams: boolean;
  fullSharedUnitControl: boolean;
  randomHero: boolean;
  randomRaces: boolean;
  referees: boolean;
  mapChecksum: string;
  mapChecksumSha1: string;
  mapName: string;
  creator: string;
};

export default class MetadataParser extends StatefulBufferParser {
  private mapmetaParser: StatefulBufferParser = new StatefulBufferParser();

  static async getUncompressedData(blocks: DataBlock[]): Promise<Buffer> {
    const buffs: Buffer[] = [];
    for (const block of blocks) {
      const block2 = await inflatePromise(block.blockContent, {
        finishFlush: constants.Z_SYNC_FLUSH,
      });
      if (block2.byteLength > 0 && block.blockContent.byteLength > 0) {
        buffs.push(block2);
      }
    }
    return Buffer.concat(buffs);
  }

  async parse(blocks: DataBlock[]): Promise<ReplayMetadata> {
   
    return this.parseData(await MetadataParser.getUncompressedData(blocks));
  }

  public async parseData(data: Buffer): Promise<ReplayMetadata> {
    this.initialize(data);
    this.skip(5);
    const playerRecords = [];
    playerRecords.push(this.parseHostRecord());
    const gameName = this.readZeroTermString("utf-8");
    this.readZeroTermString("utf-8"); // privateString
    const encodedString = this.readZeroTermString("hex");
    const mapMetadata = this.parseEncodedMapMetaString(
      this.decodeGameMetaString(encodedString),
    );
    const playerCount = this.readUInt32LE();
    const gameType = this.readStringOfLength(4, "hex");
    const localeHash = this.readStringOfLength(4, "hex");
    const playerListFinal = playerRecords.concat(
      playerRecords,
      this.parsePlayerList(),
    );
    let reforgedPlayerMetadata: ReforgedPlayerMetadata[] = [];
    if (this.peekUInt8() !== 25) {
      reforgedPlayerMetadata = this.parseReforgedPlayerMetadata();
    }
    if (this.readUInt8() !== 25) {
      console.error("Unknown chunk detected!");
      console.error(this.buffer.subarray(this.getOffset() - 1));
    }
    const remainingBytes = this.readUInt16LE();
    const slotRecordCount = this.readUInt8();
    // remaining bytes are: slotRecordCount(1), slots(9*count), seed(4), mode(1), spots(1)
    if (remainingBytes != 1 + slotRecordCount * 9 + 6) {
      console.error(
        `Remaining bytes (${remainingBytes}) do not match expected bytes (${1 + slotRecordCount * 9 + 6})`,
      );
    }
    const slotRecords = this.parseSlotRecords(slotRecordCount);
    const randomSeed = this.readUInt32LE();
    const selectMode = this.readStringOfLength(1, "hex");
    const startSpotCount = this.readUInt8();
    return {
      gameData: this.buffer.subarray(this.getOffset()),
      map: mapMetadata,
      playerCount,
      gameType,
      localeHash,
      playerRecords: playerListFinal,
      slotRecords,
      reforgedPlayerMetadata,
      randomSeed,
      selectMode,
      gameName,
      startSpotCount,
    };
  }

  private parseSlotRecords(count: number): SlotRecord[] {
    const slots: SlotRecord[] = [];
    for (let i = 0; i < count; i++) {
      const record: Partial<SlotRecord> = {};
      record.playerId = this.readUInt8();
      record.downloadProgress = this.readUInt8();
      record.slotStatus = this.readUInt8();
      record.computerFlag = this.readUInt8();
      record.teamId = this.readUInt8();
      record.color = this.readUInt8();
      record.raceFlag = this.readUInt8();
      record.aiStrength = this.readUInt8();
      record.handicapFlag = this.readUInt8();
      slots.push(record as SlotRecord);
    }
    return slots;
  }

  private parseReforgedPlayerMetadata(): ReforgedPlayerMetadata[] {
    const result: ReforgedPlayerMetadata[] = [];
    const skinSet: Map<number, number[]> = new Map();
    while (this.peekUInt8() == 0x38 || this.peekUInt8() == 0x39) {
      this.skip(1);
      const subtype = this.readUInt8();
      const followingBytes = this.readUInt32LE();
      const data = this.buffer.subarray(
        this.offset,
        this.offset + followingBytes,
      );
      if (subtype === 0x3) {
        const decoded = protoPlayer.decode(data) as unknown as {
          playerId: number;
          battleTag: string;
          clan: string;
        };
        if (decoded.clan === undefined) {
          decoded.clan = "";
        }
        result.push({
          playerId: decoded.playerId,
          name: decoded.battleTag,
          clan: decoded.clan,
          skins: [],
        });
      } else if (subtype === 0x4) {
        const decoded = protoSkin.decode(data) as unknown as {
          playerId: number;
          skins: number[];
        };
        if (decoded.skins !== undefined) {
          skinSet.set(decoded.playerId, decoded.skins);
        }
      }
      this.skip(followingBytes);
    }
    for (const player of result) {
      if (skinSet.has(player.playerId)) {
        player.skins = skinSet.get(player.playerId)!;
      }
    }
    return result;
  }

  private parseEncodedMapMetaString(buffer: Buffer): MapMetadata {
    const parser = this.mapmetaParser;
    parser.initialize(buffer);

    const speed = parser.readUInt8();
    const secondByte = parser.readUInt8();
    const thirdByte = parser.readUInt8();
    const fourthByte = parser.readUInt8();
    parser.skip(5);
    const checksum = parser.readStringOfLength(4, "hex");
    parser.skip(0);
    const mapName = parser.readZeroTermString("utf-8");
    const creator = parser.readZeroTermString("utf-8");
    parser.skip(1);
    const checksumSha1 = parser.readStringOfLength(20, "hex");
    return {
      speed,
      hideTerrain: !!(secondByte & 0b00000001),
      mapExplored: !!(secondByte & 0b00000010),
      alwaysVisible: !!(secondByte & 0b00000100),
      default: !!(secondByte & 0b00001000),
      observerMode: (secondByte & 0b00110000) >>> 4,
      teamsTogether: !!(secondByte & 0b01000000),
      fixedTeams: !!(thirdByte & 0b00000110),
      fullSharedUnitControl: !!(fourthByte & 0b00000001),
      randomHero: !!(fourthByte & 0b00000010),
      randomRaces: !!(fourthByte & 0b00000100),
      referees: !!(fourthByte & 0b01000000),
      mapName: mapName,
      creator: creator,
      mapChecksum: checksum,
      mapChecksumSha1: checksumSha1,
    };
  }

  private parsePlayerList() {
    const list: PlayerRecord[] = [];
    while (this.readUInt8() === 22) {
      list.push(this.parseHostRecord());
      this.skip(4);
    }
    this.skip(-1);
    return list;
  }

  private parseHostRecord(): PlayerRecord {
    const playerId = this.readUInt8();
    const playerName = this.readZeroTermString("utf-8");
    const addData = this.readUInt8();
    this.skip(addData);
    return { playerId, playerName };
  }

  private decodeGameMetaString(str: string): Buffer {
    const hexRepresentation = Buffer.from(str, "hex");
    const decoded = Buffer.alloc(hexRepresentation.length);
    let mask = 0;
    let dpos = 0;

    for (let i = 0; i < hexRepresentation.length; i++) {
      if (i % 8 === 0) {
        mask = hexRepresentation[i];
      } else {
        if ((mask & (0x1 << i % 8)) === 0) {
          decoded.writeUInt8(hexRepresentation[i] - 1, dpos++);
        } else {
          decoded.writeUInt8(hexRepresentation[i], dpos++);
        }
      }
    }
    return decoded;
  }
}
