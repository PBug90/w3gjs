import {
  ActionBlockList,
  Action,
  W3MMDActionType,
  CommandDataBlockType,
} from "./parsers/actions";
import Player from "./Player";
import convert from "./convert";
import { objectIdFormatter } from "./parsers/formatters";
import ReplayParser from "./ReplayParser";
import {
  GameMetaDataDecoded,
  SlotRecord,
  GameDataBlock,
  TimeSlotBlock,
  CommandDataBlock,
  ParserOutput,
  PlayerChatMessageBlock,
  ExtraPlayerListEntry,
} from "./types";
import { sortPlayers } from "./sort";
import AsyncReplayParser from "./AsyncReplayParser";
import { EventEmitter } from "events";
import { createHash } from "crypto";
import { performance } from "perf_hooks";
import {
  PlayerChatMessageBlockType,
  GameDataBlockType,
  TimeSlotBlockNewType,
  TimeSlotBlockOldType,
} from "./parsers/gamedata";

enum ChatMessageVisibility {
  All,
  Private,
  Team,
}

type ChatMessage = {
  playerName: string;
  playerId: number;
  visibility: ChatMessageVisibility;
  timeMS: number;
  message: string;
};

class W3GReplay extends EventEmitter {
  players: { [key: string]: Player };
  observers: string[];
  chatlog: ChatMessage[];
  playerActionTracker: { [key: string]: any[] } = {};
  id = "";
  leaveEvents: any[];
  w3mmd: W3MMDActionType[];
  slots: any[];
  teams: any[];
  meta: GameMetaDataDecoded;
  playerList: any[];
  totalTimeTracker = 0;
  timeSegmentTracker = 0;
  playerActionTrackInterval = 60000;
  gametype = "";
  matchup = "";
  parseStartTime: number;
  syncParser: ReplayParser;
  asyncParser: AsyncReplayParser;
  currentlyUsedParser: ReplayParser;
  filename: string;
  buffer: Buffer;
  msElapsed: number;

  constructor() {
    super();
    this.syncParser = new ReplayParser();
    this.asyncParser = new AsyncReplayParser();

    this.syncParser.on("gamemetadata", (metaData: GameMetaDataDecoded) =>
      this.handleMetaData(metaData)
    );
    this.syncParser.on("gamemetadata", (metaData: GameMetaDataDecoded) =>
      this.emit("gamemetadata", metaData)
    );
    this.syncParser.on("gamedatablock", (block: GameDataBlockType) =>
      this.processGameDataBlock(block)
    );
    this.syncParser.on("gamedatablock", (block: GameDataBlock) =>
      this.emit("gamedatablock", block)
    );
    this.syncParser.on(
      "timeslotblock",
      (block: TimeSlotBlockNewType | TimeSlotBlockOldType) =>
        this.handleTimeSlot(block)
    );
    this.syncParser.on("timeslotblock", (block: TimeSlotBlock) =>
      this.emit("timeslotblock", block)
    );

    this.asyncParser.on("gamemetadata", (metaData: GameMetaDataDecoded) =>
      this.handleMetaData(metaData)
    );
    this.asyncParser.on("gamemetadata", (metaData: GameMetaDataDecoded) =>
      this.emit("gamemetadata", metaData)
    );
    this.asyncParser.on("gamedatablock", (block: GameDataBlockType) =>
      this.processGameDataBlock(block)
    );
    this.asyncParser.on("gamedatablock", (block: GameDataBlock) =>
      this.emit("gamedatablock", block)
    );
    this.asyncParser.on(
      "timeslotblock",
      (block: TimeSlotBlockNewType | TimeSlotBlockOldType) =>
        this.handleTimeSlot(block)
    );
    this.asyncParser.on("timeslotblock", (block: TimeSlotBlock) =>
      this.emit("timeslotblock", block)
    );
  }

  parse($buffer: string | Buffer): ParserOutput {
    this.currentlyUsedParser = this.syncParser;
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

    this.syncParser.parse($buffer);

    this.generateID();
    this.determineMatchup();
    this.cleanup();

    return this.finalize();
  }

  async parseAsync($buffer: string | Buffer): Promise<ParserOutput> {
    this.currentlyUsedParser = this.asyncParser;
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

    await this.asyncParser.parse($buffer);

    this.generateID();
    this.determineMatchup();
    this.cleanup();

    return this.finalize();
  }

  handleMetaData(metaData: GameMetaDataDecoded): void {
    this.slots = metaData.playerSlotRecords;
    this.playerList = [metaData.player, ...metaData.playerList];
    this.meta = metaData;
    const tempPlayers: { [key: string]: GameMetaDataDecoded["player"] } = {};
    this.teams = [];
    this.players = {};

    this.playerList.forEach((player: GameMetaDataDecoded["player"]): void => {
      tempPlayers[player.playerId] = player;
    });
    if (metaData.extraPlayerList) {
      metaData.extraPlayerList.forEach((extraPlayer: ExtraPlayerListEntry) => {
        if (tempPlayers[extraPlayer.playerId]) {
          tempPlayers[extraPlayer.playerId].playerName = extraPlayer.name;
        }
      });
    }

    this.slots.forEach((slot: SlotRecord) => {
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
          slot.raceFlag
        );
      }
    });
  }

  processGameDataBlock(block: GameDataBlockType): void {
    switch (block.id) {
      case 31:
      case 30:
        this.totalTimeTracker += block.timeIncrement;
        this.timeSegmentTracker += block.timeIncrement;
        if (this.timeSegmentTracker > this.playerActionTrackInterval) {
          // @ts-ignore
          Object.values(this.players).forEach((p) =>
            p.newActionTrackingSegment()
          );
          this.timeSegmentTracker = 0;
        }
        break;
      case 0x20:
        this.handleChatMessage(block, this.totalTimeTracker);
        break;
      case 23:
        this.leaveEvents.push(block);
        break;
    }
  }

  handleChatMessage(block: PlayerChatMessageBlockType, timeMS: number): void {
    const message: ChatMessage = {
      playerName: this.players[block.playerId].name,
      playerId: block.playerId,
      message: block.message,
      visibility: ChatMessageVisibility.Team,
      timeMS,
    };
    this.chatlog.push(message);
  }

  handleTimeSlot(block: TimeSlotBlockNewType | TimeSlotBlockOldType): void {
    this.msElapsed = this.currentlyUsedParser.msElapsed;
    block.actions.forEach((commandBlock: CommandDataBlockType): void => {
      this.processCommandDataBlock(commandBlock);
    });
  }

  processCommandDataBlock(block: CommandDataBlockType): void {
    const currentPlayer = this.players[block.playerId];
    currentPlayer.currentTimePlayed = this.totalTimeTracker;
    currentPlayer._lastActionWasDeselect = false;
    try {
      const blocks = ActionBlockList.parse(block.actions);
      if (Array.isArray(blocks)) {
        blocks.forEach((action: Action): void => {
          this.handleActionBlock(action, currentPlayer);
        });
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  handleActionBlock(action: Action, currentPlayer: Player): void {
    this.playerActionTracker[currentPlayer.id] =
      this.playerActionTracker[currentPlayer.id] || [];
    this.playerActionTracker[currentPlayer.id].push(action);
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
        break;
    }
  }

  isObserver(player: Player): boolean {
    return (
      (player.teamid === 24 &&
        this.currentlyUsedParser.header.subheader.version >= 29) ||
      (player.teamid === 12 &&
        this.currentlyUsedParser.header.subheader.version < 29)
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

    const idBase = this.meta.randomSeed + players + this.meta.mapName;
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
      this.currentlyUsedParser.header.subheader.version >= 29 &&
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
      referees: !!this.meta.referees,
      fixedTeams: !!this.meta.fixedTeams,
      fullSharedUnitControl: !!this.meta.fullSharedUnitControl,
      alwaysVisible: !!this.meta.alwaysVisible,
      hideTerrain: !!this.meta.hideTerrain,
      mapExplored: !!this.meta.mapExplored,
      teamsTogether: !!this.meta.teamsTogether,
      randomHero: !!this.meta.randomHero,
      randomRaces: !!this.meta.randomRaces,
      speed: this.meta.speed,
    };

    const root = {
      id: this.id,
      gamename: this.meta.gameName,
      randomseed: this.meta.randomSeed,
      startSpots: this.meta.startSpotCount,
      observers: this.observers,
      players: Object.values(this.players).sort(sortPlayers),
      matchup: this.matchup,
      creator: this.meta.creator,
      type: this.gametype,
      chat: this.chatlog,
      apm: {
        trackingInterval: this.playerActionTrackInterval,
      },
      map: {
        path: this.meta.mapName,
        file: convert.mapFilename(this.meta.mapName),
        checksum: this.meta.mapChecksum,
      },
      version: convert.gameVersion(
        this.currentlyUsedParser.header.subheader.version
      ),
      buildNumber: this.currentlyUsedParser.header.subheader.buildNo,
      duration: this.currentlyUsedParser.header.subheader.replayLengthMS,
      expansion:
        this.currentlyUsedParser.header.subheader.gameIdentifier === "PX3W",
      settings,
      parseTime: Math.round(performance.now() - this.parseStartTime),
    };
    return root;
  }
}

export default W3GReplay;
