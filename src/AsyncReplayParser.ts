import ReplayParser from "./ReplayParser";
import { Parser } from "binary-parser";
import { GameDataParser } from "./parsers/gamedata";
import { promisify } from "util";
import { EncodedMapMetaString, GameMetaData } from "./parsers/header";
import { readFile } from "fs";
import { inflate, constants } from "zlib";

const readFilePromise = promisify(readFile);
const inflatePromise = promisify(inflate) as (
  file: string,
  options: object
) => Promise<any>;
const setImmediatePromise = promisify(setImmediate);

class AsyncReplayParser extends ReplayParser {
  async parse(input: string | Buffer): Promise<any> {
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

    for (const block of this.header.blocks) {
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
    await this._parseGameDataBlocks();
  }

  async _parseGameDataBlocks(): Promise<any> {
    for (const block of this.gameMetaDataDecoded.blocks) {
      this.emit("gamedatablock", block);
      this.processGameDataBlock(block);
      await setImmediatePromise();
    }
  }
}

export default AsyncReplayParser;
