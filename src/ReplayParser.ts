import { Parser } from "binary-parser";
import { ActionBlockList } from "./parsers/actions";
import {
  ReplayHeader,
  EncodedMapMetaString,
  GameMetaData,
} from "./parsers/header";
import { GameDataParser } from "./parsers/gamedata";

import {
  TimeSlotBlock,
  CommandDataBlock,
  GameDataBlock,
  ActionBlock,
  CompressedDataBlock,
} from "./types";

import { readFileSync } from "fs";
import { inflateSync, constants } from "zlib";
import { EventEmitter } from "events";

class ReplayParser extends EventEmitter {
  filename: string;
  buffer: Buffer;
  msElapsed = 0;
  header: any;
  decompressed: Buffer;
  gameMetaDataDecoded: any;

  constructor() {
    super();
    this.buffer = Buffer.from("");
    this.filename = "";
    this.decompressed = Buffer.from("");
  }

  parse($buffer: string | Buffer): void {
    this.msElapsed = 0;
    this.buffer = Buffer.isBuffer($buffer) ? $buffer : readFileSync($buffer);
    this.buffer = this.buffer.slice(
      this.buffer.indexOf("Warcraft III recorded game")
    );
    this.filename = Buffer.isBuffer($buffer) ? "buffer" : $buffer;
    const decompressed: Buffer[] = [];

    this.parseHeader();

    this.header.blocks.forEach((block: CompressedDataBlock) => {
      if (block.blockSize > 0 && block.blockDecompressedSize === 8192) {
        try {
          const r = inflateSync(block.compressed, {
            finishFlush: constants.Z_SYNC_FLUSH,
          });
          if (r.byteLength > 0 && block.compressed.byteLength > 0) {
            decompressed.push(r);
          }
        } catch (ex) {
          console.log(ex);
        }
      }
    });
    this.decompressed = Buffer.concat(decompressed);

    this.gameMetaDataDecoded = new Parser()
      .nest("meta", { type: GameMetaData })
      .nest("blocks", { type: GameDataParser })
      .parse(this.decompressed);
      
    const decodedMetaStringBuffer = this.decodeGameMetaString(
      this.gameMetaDataDecoded.meta.encodedString
    );
    const meta = {
      ...this.gameMetaDataDecoded,
      ...this.gameMetaDataDecoded.meta,
      ...EncodedMapMetaString.parse(decodedMetaStringBuffer),
    };
    const newMeta = meta;
    delete newMeta.meta;
    this.emit("gamemetadata", newMeta);
    this.parseGameDataBlocks();
  }

  protected parseHeader(): void {
    this.header = ReplayHeader.parse(this.buffer);
  }

  private parseGameDataBlocks(): void {
    this.gameMetaDataDecoded.blocks.forEach((block: GameDataBlock) => {
      this.emit("gamedatablock", block);
      this.processGameDataBlock(block);
    });
  }

  protected processGameDataBlock(block: GameDataBlock): void {
    switch (block.type) {
      case 31:
      case 30:
        this.msElapsed += block.timeIncrement;
        this.emit("timeslotblock", (block as unknown) as TimeSlotBlock);
        this.processTimeslotBlock((block as unknown) as TimeSlotBlock);
        break;
    }
  }

  protected processTimeslotBlock(timeSlotBlock: TimeSlotBlock): void {
    timeSlotBlock.actions.forEach((block: CommandDataBlock): void => {
      this.processCommandDataBlock(block);
      this.emit("commandblock", block);
    });
  }

  private processCommandDataBlock(actionBlock: CommandDataBlock): void {
    try {
      const blocks = ActionBlockList.parse(actionBlock.actions);
      if (Array.isArray(blocks)) {
        blocks.forEach((action: ActionBlock): void => {
          this.emit("actionblock", action, actionBlock.playerId);
        });
      }
    } catch (ex) {
      console.log(actionBlock.actions.toString("hex"));
      console.error(ex);
    }
  }

  protected decodeGameMetaString(str: string): Buffer {
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

export default ReplayParser;
