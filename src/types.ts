import Player from "./Player";
import { ChatMessage, ObserverMode } from "./W3GReplay";

export enum Race {
  Human = "H",
  NightElf = "N",
  Orc = "O",
  Undead = "U",
  Random = "R",
}

interface AlphaNumericItemId {
  type: "alphanumeric";
  value: number[];
}

interface StringEncodedItemId {
  type: "stringencoded";
  value: string;
}

export type ItemID = AlphaNumericItemId | StringEncodedItemId;
export interface ParserOutput {
  id: string;
  gamename: string;
  randomseed: number;
  startSpots: number;
  observers: string[];
  players: Player[];
  matchup: string;
  creator: string;
  type: string;
  chat: ChatMessage[];
  apm: {
    trackingInterval: number;
  };
  map: {
    path: string;
    file: string;
    checksum: string;
    checksumSha1: string;
  };
  buildNumber: number;
  version: string;
  duration: number;
  expansion: boolean;
  parseTime: number;
  winningTeamId: number;
  settings: {
    observerMode: ObserverMode;
    fixedTeams: boolean;
    fullSharedUnitControl: boolean;
    alwaysVisible: boolean;
    hideTerrain: boolean;
    mapExplored: boolean;
    teamsTogether: boolean;
    randomHero: boolean;
    randomRaces: boolean;
    speed: number;
  };
}
