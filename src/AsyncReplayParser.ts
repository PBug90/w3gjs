import ReplayParser from "./ReplayParser";
import { Parser } from "binary-parser";
import { GameDataParser, GameDataBlockType } from "./parsers/gamedata";
import { promisify } from "util";
import { EncodedMapMetaString, GameMetaData } from "./parsers/header";
import { readFile } from "fs";
import { inflate, constants, ZlibOptions } from "zlib";

const readFilePromise = promisify(readFile);
const inflatePromise = promisify(inflate) as (
  input: Buffer,
  options: ZlibOptions
) => Promise<Buffer>;
const setImmediatePromise = promisify(setImmediate);

const ReplayDataParser = new Parser()
  .nest("meta", { type: GameMetaData })
  .nest("blocks", { type: GameDataParser });

class AsyncReplayParser extends ReplayParser {
  async parse(input: string | Buffer): Promise<void> {
    this.msElapsed = 0;
    if (Buffer.isBuffer(input)) {
      this.buffer = input;
      this.filename = "buffer";
    } else {
      this.buffer = await readFilePromise(input);
      this.filename = input;
    }
    this.buffer = this.buffer.slice(
      this.buffer.indexOf("Warcraft III recorded game")
    );
    const decompressedCommandBlocks: Buffer[] = [];

    this.parseHeader();

    for (const block of this.header.blocks.blocks) {
      if (block.blockSize > 0 && block.blockDecompressedSize === 8192) {
        try {
          const r = await inflatePromise(block.compressed, {
            finishFlush: constants.Z_SYNC_FLUSH,
          });
          if (r.byteLength > 0 && block.compressed.byteLength > 0) {
            decompressedCommandBlocks.push(r);
          }
        } catch (ex) {
          console.log(ex);
        }
      }
    }
    this.decompressed = Buffer.concat(decompressedCommandBlocks);
    const result = ReplayDataParser.parse(this.decompressed);
    const decodedMetaStringBuffer = this.decodeGameMetaString(
      result.meta.encodedString
    );
    const meta2 = {
      ...result.meta,
      ...EncodedMapMetaString.parse(decodedMetaStringBuffer),
    };
    this.emit("gamemetadata", meta2);
    await this._parseGameDataBlocks(
      result.blocks.blocks as GameDataBlockType[]
    );
  }

  async _parseGameDataBlocks(blocks: GameDataBlockType[]): Promise<void> {
    for (const block of blocks) {
      this.emit("gamedatablock", block);
      this.processGameDataBlock(block);
      await setImmediatePromise();
    }
  }
}

export default AsyncReplayParser;
