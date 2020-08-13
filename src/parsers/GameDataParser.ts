import { EventEmitter } from "events";
import StatefulBufferParser from "./StatefulBufferParser";
import ActionParser from "./ActionParser";
import { Action } from "./ActionParser";

export type LeaveGameBlock = {
  id: 0x17;
  playerId: number;
  reason: string;
  result: string;
};

export type TimeslotBlock = {
  id: 0x1f | 0x1e;
  timeIncrement: number;
  commandBlocks: CommandBlock[];
};

export type CommandBlock = {
  playerId: number;
  actions: Action[];
};

export type PlayerChatMessageBlock = {
  id: 0x20;
  playerId: number;
  message: string;
};

export type GameDataBlock =
  | LeaveGameBlock
  | TimeslotBlock
  | PlayerChatMessageBlock;

export default class GameDataParserc extends EventEmitter {
  private actionParser: ActionParser;
  private parser: StatefulBufferParser;
  constructor() {
    super();
    this.actionParser = new ActionParser();
    this.parser = new StatefulBufferParser();
  }

  async parse(data: Buffer): Promise<void> {
    this.parser.initialize(data);
    while (this.parser.offset < data.length) {
      const block = this.parseBlock();
      if (block !== null) {
        this.emit("gamedatablock", block);
      }
    }
  }

  private parseBlock(): GameDataBlock | null {
    const id = this.parser.readUInt8();
    switch (id) {
      case 0x17:
        return this.parseLeaveGameBlock();
      case 0x1a:
        this.parser.skip(4);
        break;
      case 0x1b:
        this.parser.skip(4);
        break;
      case 0x1c:
        this.parser.skip(4);
        break;
      case 0x1f:
        return this.parseTimeslotBlock();
      case 0x1e:
        return this.parseTimeslotBlock();
      case 0x20:
        return this.parseChatMessage();
      case 0x22:
        this.parseUnknown0x22();
        break;
      case 0x23:
        this.parser.skip(10);
        break;
      case 0x2f:
        this.parser.skip(8);
        break;
    }
    return null;
  }

  private parseUnknown0x22(): void {
    const length = this.parser.readUInt8();
    this.parser.skip(length);
  }

  private parseChatMessage(): PlayerChatMessageBlock {
    const playerId = this.parser.readUInt8();
    const byteCount = this.parser.readUInt16LE();
    const flags = this.parser.readUInt8();
    if (flags === 0x20) {
      this.parser.skip(4);
    }
    const message = this.parser.readZeroTermString("utf-8");
    return {
      id: 0x20,
      playerId,
      message,
    };
  }

  private parseLeaveGameBlock(): LeaveGameBlock {
    const reason = this.parser.readStringOfLength(4, "hex");
    const playerId = this.parser.readUInt8();
    const result = this.parser.readStringOfLength(4, "hex");
    this.parser.skip(4);
    return {
      id: 0x17,
      reason,
      playerId,
      result,
    };
  }

  private parseTimeslotBlock(): TimeslotBlock {
    const byteCount = this.parser.readUInt16LE();
    const timeIncrement = this.parser.readUInt16LE();
    const actionBlockLastOffset = this.parser.offset + byteCount - 2;
    const commandBlocks: CommandBlock[] = [];
    while (this.parser.offset < actionBlockLastOffset) {
      const commandBlock: Partial<CommandBlock> = {};
      commandBlock.playerId = this.parser.readUInt8();
      const actionBlockLength = this.parser.readUInt16LE();
      const actions = this.parser.buffer.slice(
        this.parser.offset,
        this.parser.offset + actionBlockLength
      );
      commandBlock.actions = this.actionParser.parse(actions);
      this.parser.skip(actionBlockLength);
      commandBlocks.push(commandBlock as CommandBlock);
    }
    return { id: 0x1f, timeIncrement, commandBlocks };
  }
}
