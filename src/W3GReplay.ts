import Player from "./Player";
import convert from "./convert";
import { objectIdFormatter, raceFlagFormatter } from "./parsers/formatters";
import { ParserOutput } from "./types";
import { sortPlayers } from "./sort";
import { EventEmitter } from "events";
import { createHash } from "crypto";
import { performance } from "perf_hooks";
import ReplayParser, {
  ParserOutput as ReplayParserOutput,
  BasicReplayInformation,
} from "./parsers/ReplayParser";
import { readFile } from "fs";
import { promisify } from "util";
import {
  GameDataBlock,
  PlayerChatMessageBlock,
  TimeslotBlock,
  CommandBlock,
  LeaveGameBlock,
} from "./parsers/GameDataParser";
import { Action, W3MMDAction } from "./parsers/ActionParser";
import W3MMDHandler from "./W3MMDHandler";

const readFilePromise = promisify(readFile);

enum ChatMessageMode {
  All = "All",
  Private = "Private",
  Team = "Team",
}

export type ChatMessage = {
  playerName: string;
  playerId: number;
  mode: ChatMessageMode;
  timeMS: number;
  message: string;
};

type Team = {
  [key: number]: number[];
};

class W3GReplay extends EventEmitter {
  info: BasicReplayInformation;
  players: { [key: string]: Player };
  observers: string[];
  chatlog: ChatMessage[];
  id = "";
  leaveEvents: LeaveGameBlock[];
  w3mmd: W3MMDAction[];
  slots: ReplayParserOutput["metadata"]["slotRecords"];
  teams: Team;
  meta: ReplayParserOutput["metadata"];
  playerList: ReplayParserOutput["metadata"]["playerRecords"];
  totalTimeTracker = 0;
  timeSegmentTracker = 0;
  playerActionTrackInterval = 60000;
  gametype = "";
  matchup = "";
  parseStartTime: number;
  parser: ReplayParser;
  filename: string;
  buffer: Buffer;
  msElapsed = 0;
  w3mmdHandler: W3MMDHandler;

  constructor() {
    super();
    this.parser = new ReplayParser();

    this.parser.on(
      "basic_replay_information",
      (information: BasicReplayInformation) => {
        this.handleBasicReplayInformation(information);
        this.emit("basic_replay_inforamtion", information);
      }
    );
    this.parser.on("gamedatablock", (block) => {
      this.emit("gamedatablock", block);
      this.processGameDataBlock(block);
    });
  }

  async parse($buffer: string | Buffer): Promise<ParserOutput> {
    this.msElapsed = 0;
    this.w3mmdHandler = new W3MMDHandler();
    this.parseStartTime = performance.now();
    this.buffer = Buffer.from("");
    this.filename = "";
    this.id = "";
    this.chatlog = [];
    this.leaveEvents = [];
    this.w3mmd = [];
    this.players = {};
    this.totalTimeTracker = 0;
    this.timeSegmentTracker = 0;
    this.playerActionTrackInterval = 60000;
    if (typeof $buffer === "string") {
      $buffer = await readFilePromise($buffer);
    }
    await this.parser.parse($buffer);

    this.generateID();
    this.determineMatchup();
    this.cleanup();

    return this.finalize();
  }

  handleBasicReplayInformation(info: BasicReplayInformation): void {
    this.info = info;
    this.slots = info.metadata.slotRecords;
    this.playerList = info.metadata.playerRecords;
    this.meta = info.metadata;
    const tempPlayers: {
      [key: string]: BasicReplayInformation["metadata"]["playerRecords"][0];
    } = {};
    this.teams = [];
    this.players = {};

    this.playerList.forEach((player): void => {
      tempPlayers[player.playerId] = player;
    });
    if (info.metadata.reforgedPlayerMetadata.length > 0) {
      const extraPlayerList = info.metadata.reforgedPlayerMetadata;
      extraPlayerList.forEach((extraPlayer) => {
        if (tempPlayers[extraPlayer.playerId]) {
          tempPlayers[extraPlayer.playerId].playerName = extraPlayer.name;
        }
      });
    }

    this.slots.forEach((slot) => {
      if (slot.slotStatus > 1) {
        this.teams[slot.teamId] = this.teams[slot.teamId] || [];
        this.teams[slot.teamId].push(slot.playerId);

        this.players[slot.playerId] = new Player(
          slot.playerId,
          tempPlayers[slot.playerId]
            ? tempPlayers[slot.playerId].playerName
            : "Computer",
          slot.teamId,
          slot.color,
          raceFlagFormatter(slot.raceFlag)
        );
      }
    });
  }

  processGameDataBlock(block: GameDataBlock): void {
    switch (block.id) {
      case 31:
      case 30:
        this.totalTimeTracker += block.timeIncrement;
        this.timeSegmentTracker += block.timeIncrement;
        if (this.timeSegmentTracker > this.playerActionTrackInterval) {
          Object.values(this.players).forEach((p) =>
            p.newActionTrackingSegment()
          );
          this.timeSegmentTracker = 0;
        }
        this.handleTimeSlot(block);
        break;
      case 0x20:
        this.handleChatMessage(block, this.totalTimeTracker);
        break;
      case 23:
        this.leaveEvents.push(block);
        break;
    }
  }

  handleChatMessage(block: PlayerChatMessageBlock, timeMS: number): void {
    const message: ChatMessage = {
      playerName: this.players[block.playerId].name,
      playerId: block.playerId,
      message: block.message,
      mode: ChatMessageMode.Team,
      timeMS,
    };
    this.chatlog.push(message);
  }

  handleTimeSlot(block: TimeslotBlock): void {
    this.msElapsed += block.timeIncrement;
    block.commandBlocks.forEach((commandBlock): void => {
      this.processCommandDataBlock(commandBlock);
    });
  }

  processCommandDataBlock(block: CommandBlock): void {
    const currentPlayer = this.players[block.playerId];
    currentPlayer.currentTimePlayed = this.totalTimeTracker;
    currentPlayer._lastActionWasDeselect = false;

    block.actions.forEach((action: Action): void => {
      this.handleActionBlock(action, currentPlayer);
    });
  }

  handleActionBlock(action: Action, currentPlayer: Player): void {
    switch (action.id) {
      case 0x10:
        if (
          objectIdFormatter(action.itemId).value === "tert" ||
          objectIdFormatter(action.itemId).value === "tret"
        ) {
          currentPlayer.handleRetraining(this.totalTimeTracker);
        }
        currentPlayer.handle0x10(
          objectIdFormatter(action.itemId),
          this.totalTimeTracker
        );
        break;
      case 0x11:
        currentPlayer.handle0x11(
          objectIdFormatter(action.itemId),
          this.totalTimeTracker
        );
        break;
      case 0x12:
        currentPlayer.handle0x12(objectIdFormatter(action.itemId));
        break;
      case 0x13:
        currentPlayer.handle0x13();
        break;
      case 0x14:
        currentPlayer.handle0x14(objectIdFormatter(action.itemId1));
        break;
      case 0x16:
        if (action.selectMode === 0x02) {
          currentPlayer._lastActionWasDeselect = true;
          currentPlayer.handle0x16(action.selectMode, true);
        } else {
          if (currentPlayer._lastActionWasDeselect === false) {
            currentPlayer.handle0x16(action.selectMode, true);
          }
          currentPlayer._lastActionWasDeselect = false;
        }
        break;
      case 0x17:
      case 0x18:
      case 0x1c:
      case 0x1d:
      case 0x1e:
      case 0x61:
      case 0x65:
      case 0x66:
      case 0x67:
        currentPlayer.handleOther(action.id);
        break;
      case 0x6b:
        this.w3mmd.push(action);
        this.w3mmdHandler.handleAction(action, currentPlayer.id);
        break;
    }
  }

  isObserver(player: Player): boolean {
    return (
      (player.teamid === 24 && this.info.subheader.version >= 29) ||
      (player.teamid === 12 && this.info.subheader.version < 29)
    );
  }

  determineMatchup(): void {
    const teamRaces: { [key: string]: string[] } = {};
    Object.values(this.players).forEach((p) => {
      if (!this.isObserver(p)) {
        teamRaces[p.teamid] = teamRaces[p.teamid] || [];
        teamRaces[p.teamid].push(p.raceDetected || p.race);
      }
    });
    this.gametype = Object.values(teamRaces)
      .map((e) => e.length)
      .sort()
      .join("on");
    this.matchup = Object.values(teamRaces)
      .map((e) => e.sort().join(""))
      .sort()
      .join("v");
  }

  generateID(): void {
    const players = Object.values(this.players)
      .filter((p) => this.isObserver(p) === false)
      .sort((player1, player2) => {
        if (player1.id < player2.id) {
          return -1;
        }
        return 1;
      })
      .reduce((accumulator, player) => {
        accumulator += player.name;
        return accumulator;
      }, "");

    const idBase = this.info.metadata.randomSeed + players + this.meta.gameName;
    this.id = createHash("sha256").update(idBase).digest("hex");
  }

  cleanup(): void {
    this.observers = [];

    Object.values(this.players).forEach((p) => {
      p.newActionTrackingSegment(this.playerActionTrackInterval);
      p.cleanup();
      if (this.isObserver(p)) {
        this.observers.push(p.name);
        delete this.players[p.id];
      }
    });

    if (
      this.info.subheader.version >= 2 &&
      Object.prototype.hasOwnProperty.call(this.teams, "24")
    ) {
      delete this.teams[24];
    } else if (Object.prototype.hasOwnProperty.call(this.teams, "12")) {
      delete this.teams[12];
    }
    delete this.slots;
    delete this.playerList;
    delete this.buffer;
  }

  finalize(): ParserOutput {
    const settings = {
      referees: this.meta.map.referees,
      fixedTeams: this.meta.map.fixedTeams,
      fullSharedUnitControl: this.meta.map.fullSharedUnitControl,
      alwaysVisible: this.meta.map.alwaysVisible,
      hideTerrain: this.meta.map.hideTerrain,
      mapExplored: this.meta.map.mapExplored,
      teamsTogether: this.meta.map.teamsTogether,
      randomHero: this.meta.map.randomHero,
      randomRaces: this.meta.map.randomRaces,
      speed: this.meta.map.speed,
    };

    const root = {
      id: this.id,
      gamename: this.meta.gameName,
      randomseed: this.meta.randomSeed,
      startSpots: this.meta.startSpotCount,
      observers: this.observers,
      players: Object.values(this.players).sort(sortPlayers),
      matchup: this.matchup,
      creator: this.meta.map.creator,
      type: this.gametype,
      chat: this.chatlog,
      apm: {
        trackingInterval: this.playerActionTrackInterval,
      },
      map: {
        path: this.meta.map.mapName,
        file: convert.mapFilename(this.meta.map.mapName),
        checksum: this.meta.map.mapChecksum,
      },
      version: convert.gameVersion(this.info.subheader.version),
      buildNumber: this.info.subheader.buildNo,
      duration: this.info.subheader.replayLengthMS,
      expansion: this.info.subheader.gameIdentifier === "PX3W",
      settings,
      parseTime: Math.round(performance.now() - this.parseStartTime),
    };
    return root;
  }
}

export default W3GReplay;
