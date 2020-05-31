import Player from "./Player";

export enum Races {
  humans = "H",
  nightElves = "N",
  orcs = "O",
  undeads = "U",
}

export enum Platform {
  BattleNet = "battlenet",
  NetEase = "netease",
}

export interface SlotRecord {
  playerId: number;
  slotStatus: number;
  computerFlag: number;
  teamId: number;
  color: number;
  raceFlag: Races;
  aiStrength: number;
  handicapFlag: number;
}

export interface ExtraPlayerListEntry {
  nameLength: number;
  name: string;
  playerId: number;
}

export interface GameMetaDataDecoded {
  player: {
    hasRecord?: number;
    playerId: number;
    playerName: string;
    addDataFlag?: number;
    addDataFlagHost?: number;
    additional: {
      runtimeMs?: string;
      raceFlags?: Races;
    };
  };
  gameName: string;
  privateString: string;
  encodedString: string;
  playerCount: number;
  gameType: string;
  languageId: string;
  playerList: GameMetaDataDecoded["player"][];
  gameStartRecord: number;
  dataByteCount: number;
  slotRecordCount: number;
  playerSlotRecords: SlotRecord[];
  randomSeed: number;
  selectMode: string;
  startSpotCount: number;
  speed: number;
  hideTerrain: number;
  mapExplored: number;
  alwaysVisible: number;
  default: number;
  observerMode: number;
  teamsTogether: number;
  empty: number;
  fixedTeams: number;
  fullSharedUnitControl: number;
  randomHero: number;
  randomRaces: number;
  referees: number;
  mapChecksum: string;
  mapName: string;
  creator: string;
  extraPlayerList?: ExtraPlayerListEntry[];
}

export interface ActionBlock {
  actionId: number;
  [key: string]: any;
}

export interface TimeSlotBlock {
  byteCount: number;
  timeIncrement: number;
  actions: any[];
}

export interface LeaveGameBlock {
  reason: string;
  playerId: number;
  result: string;
}

export interface TimeSlotBlock0x1f {
  byteCount: number;
  timeIncrement: number;
  actions: any[];
}

export interface PlayerChatMessageBlock {
  playerId: number;
  byteCount: number;
  flags: number;
  chatMode?: number;
}

export interface Unknown0x22 {
  length: number;
}

export interface CompressedDataBlock {
  blockSize: number;
  blockDecompressedSize: number;
  unknown: string;
  compressed: Buffer;
}

export interface CommandDataBlock {
  playerId: number;
  blockLength: number;
  actions: Buffer;
}

export interface GameDataBlock {
  type: number;
  [key: string]: any;
}

export interface ItemID {
  type: "alphanumeric" | "stringencoded";
  value: any;
}

export interface ParserOutput {
  id: string;
  gamename: GameMetaDataDecoded["gameName"];
  randomseed: GameMetaDataDecoded["randomSeed"];
  startSpots: GameMetaDataDecoded["startSpotCount"];
  observers: string[];
  players: Player[];
  matchup: string;
  creator: GameMetaDataDecoded["creator"];
  type: string;
  chat: any[];
  apm: {
    trackingInterval: number;
  };
  map: {
    path: GameMetaDataDecoded["mapName"];
    file: string;
    checksum: GameMetaDataDecoded["mapChecksum"];
  };
  buildNumber: number;
  version: string;
  duration: number;
  expansion: boolean;
  parseTime: number;
  settings: {
    referees: boolean;
    fixedTeams: boolean;
    fullSharedUnitControl: boolean;
    alwaysVisible: boolean;
    hideTerrain: boolean;
    mapExplored: boolean;
    teamsTogether: boolean;
    randomHero: boolean;
    randomRaces: boolean;
    speed: GameMetaDataDecoded["speed"];
  };
}
