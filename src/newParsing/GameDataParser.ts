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

export default class GameDataParserc extends EventEmitter {
  private msElapsed = 0;
  async parse(data: Buffer): Promise<void> {
    this.msElapsed = 0;
    const result = GameDataParser.parse(data);
    this.parseGameDataBlocks(result.blocks as GameDataBlockType[]);
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
        this.msElapsed += block.timeIncrement;
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
