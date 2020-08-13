import { EventEmitter } from "events";
import StatefulBufferParserMixin from "./StatefulBufferParserMixin";
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

export default class GameDataParserc extends StatefulBufferParserMixin(
  EventEmitter
) {
  private actionParser: ActionParser;
  constructor() {
    super();
    this.actionParser = new ActionParser();
  }

  async parse(data: Buffer): Promise<void> {
    this.initialize(data);
    while (this.offset < data.length) {
      const block = this.parseBlock();
      if (block !== null) {
        this.emit("gamedatablock", block);
      }
    }
  }

  private parseBlock(): GameDataBlock | null {
    const id = this.readUInt8();
    switch (id) {
      case 0x17:
        return this.parseLeaveGameBlock();
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
        return this.parseTimeslotBlock();
      case 0x1e:
        return this.parseTimeslotBlock();
      case 0x20:
        return this.parseChatMessage();
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
    return null;
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
      id: 0x20,
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
      id: 0x17,
      reason,
      playerId,
      result,
    };
  }

  private parseTimeslotBlock(): TimeslotBlock {
    const byteCount = this.readUInt16LE();
    const timeIncrement = this.readUInt16LE();
    const actionBlockLastOffset = this.offset + byteCount - 2;
    const commandBlocks: CommandBlock[] = [];
    while (this.offset < actionBlockLastOffset) {
      const commandBlock: Partial<CommandBlock> = {};
      commandBlock.playerId = this.readUInt8();
      const actionBlockLength = this.readUInt16LE();
      const actions = this.buffer.slice(
        this.offset,
        this.offset + actionBlockLength
      );
      commandBlock.actions = this.actionParser.parse(actions);
      this.skip(actionBlockLength);
      commandBlocks.push(commandBlock as CommandBlock);
    }
    return { id: 0x1f, timeIncrement, commandBlocks };
  }
}
