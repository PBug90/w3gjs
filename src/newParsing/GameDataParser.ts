import {
  GameDataParser,
  GameDataBlockType,
  TimeSlotBlockNewType,
} from "../parsers/gamedata";
import {
  CommandDataBlockType,
  ActionBlockList,
  ActionType,
} from "../parsers/actions";
import { EventEmitter } from "events";
import StatefulBufferParserMixin from "./StatefulBufferParserMixin";
import ActionParser from "./ActionParser";

type LeaveGameBlock = {
  playerId: number;
  reason: string;
  result: string;
};

type TimeslotBlock = {
  timeIncrement: number;
};

type PlayerChatMessageBlock = {
  playerId: number;
  message: string;
};

export default class GameDataParserc extends StatefulBufferParserMixin(
  EventEmitter
) {
  private actionParser: ActionParser;
  constructor() {
    super();
    this.actionParser = new ActionParser();
  }

  async parse(data: Buffer): Promise<void> {
    const result = GameDataParser.parse(data);
    this.initialize(data);
    this.parseGameDataBlocks(result.blocks as GameDataBlockType[]);
    while (this.offset < data.length) {
      this.parseBlock();
    }
  }

  private parseBlock() {
    const id = this.readUInt8();
    switch (id) {
      case 0x17:
        this.parseLeaveGameBlock();
        break;
      case 0x1a:
        this.skip(4);
        break;
      case 0x1b:
        this.skip(4);
        break;
      case 0x1c:
        this.skip(4);
        break;
      case 0x1f:
        this.parseTimeslotBlock();
        break;
      case 0x1e:
        this.parseTimeslotBlock();
        break;
      case 0x20:
        this.parseChatMessage();
        break;
      case 0x22:
        this.parseUnknown0x22();
        break;
      case 0x23:
        this.skip(10);
        break;
      case 0x2f:
        this.skip(8);
        break;
    }
  }

  private parseUnknown0x22(): void {
    const length = this.readUInt8();
    this.skip(length);
  }

  private parseChatMessage(): PlayerChatMessageBlock {
    const playerId = this.readUInt8();
    const byteCount = this.readUInt16LE();
    const flags = this.readUInt8();
    if (flags === 0x20) {
      this.skip(4);
    }
    const message = this.readZeroTermString("utf-8");
    return {
      playerId,
      message,
    };
  }

  private parseLeaveGameBlock(): LeaveGameBlock {
    const reason = this.readStringOfLength(4, "hex");
    const playerId = this.readUInt8();
    const result = this.readStringOfLength(4, "hex");
    this.skip(4);
    return {
      reason,
      playerId,
      result,
    };
  }

  private parseTimeslotBlock(): TimeslotBlock {
    const byteCount = this.readUInt16LE();
    const timeIncrement = this.readUInt16LE();
    const actionBlockLastOffset = this.offset + byteCount - 2;
    while (this.offset < actionBlockLastOffset) {
      const playerId = this.readUInt8();
      const actionBlockLength = this.readUInt16LE();
      const actions = this.buffer.slice(
        this.offset,
        this.offset + actionBlockLength
      );
      this.actionParser.parse(actions);
      this.skip(actionBlockLength);
    }
    return { timeIncrement };
  }

  private parseGameDataBlocks(blocks: GameDataBlockType[]): void {
    blocks.forEach((block: GameDataBlockType) => {
      this.emit("gamedatablock", block);
      this.processGameDataBlock(block);
    });
  }

  protected processGameDataBlock(block: GameDataBlockType): void {
    switch (block.id) {
      case 31:
      case 30:
        this.emit("timeslotblock", block as TimeSlotBlockNewType);
        this.processTimeslotBlock(block as TimeSlotBlockNewType);
        break;
    }
  }

  protected processTimeslotBlock(timeSlotBlock: TimeSlotBlockNewType): void {
    timeSlotBlock.actions.forEach((block: CommandDataBlockType): void => {
      this.processCommandDataBlock(block);
      this.emit("commandblock", block);
    });
  }

  private processCommandDataBlock(actionBlock: CommandDataBlockType): void {
    try {
      const blocks = ActionBlockList.parse(actionBlock.actions);
      if (Array.isArray(blocks)) {
        blocks.forEach((action: ActionType): void => {
          this.emit("actionblock", action, actionBlock.playerId);
        });
      }
    } catch (ex) {
      console.error(ex);
    }
  }
}
