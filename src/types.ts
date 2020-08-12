import Player from "./Player";

export enum Race {
  Human = "H",
  NightElf = "N",
  Orc = "O",
  Undead = "U",
  Random = "R",
}

export interface ItemID {
  type: "alphanumeric" | "stringencoded";
  value: any;
}

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
  chat: any[];
  apm: {
    trackingInterval: number;
  };
  map: {
    path: string;
    file: string;
    checksum: string;
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
    speed: number;
  };
}
