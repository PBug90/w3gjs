import StatefulBufferParser from "./StatefulBufferParser";
export type Header = {
  compressedSize: number;
  headerVersion: string;
  decompressedSize: number;
  compressedDataBlockCount: number;
};

export type SubHeader = {
  gameIdentifier: string;
  version: number;
  buildNo: number;
  replayLengthMS: number;
};

type RawReplayData = {
  header: Header;
  subheader: SubHeader;
  blocks: DataBlock[];
};

export type DataBlock = {
  blockSize: number;
  blockDecompressedSize: number;
  blockContent: Buffer;
};

export default class CustomReplayParser extends StatefulBufferParser {
  private header: Header;
  private subheader: SubHeader;

  constructor() {
    super();
  }

  public async parse(input: Buffer): Promise<RawReplayData> {
    this.initialize(input);
    this.header = this.parseHeader();
    this.subheader = this.parseSubheader();
    return {
      header: this.header,
      subheader: this.subheader,
      blocks: this.parseBlocks(),
    };
  }

  private parseBlocks(): DataBlock[] {
    const blocks: DataBlock[] = [];

    while (this.getOffset() < this.buffer.length) {
      const block = this.parseBlock();
      if (block.blockDecompressedSize === 8192) {
        blocks.push(block);
      }
    }
    return blocks;
  }

  private parseBlock(): DataBlock {
    const isReforged = this.subheader.buildNo < 6089 ? false : true;
    const blockSize = this.readUInt16LE();

    this.skip(isReforged ? 2 : 0);
    const blockDecompressedSize = this.readUInt16LE();

    this.skip(isReforged ? 6 : 4);
    const blockContent = this.buffer.subarray(
      this.getOffset(),
      this.getOffset() + blockSize,
    );
    this.skip(blockSize);
    return {
      blockSize,
      blockDecompressedSize,
      blockContent,
    };
  }

  private parseSubheader(): SubHeader {
    const gameIdentifier = this.readStringOfLength(4, "utf-8");
    const version = this.readUInt32LE();
    const buildNo = this.readUInt16LE();
    this.skip(2);
    const replayLengthMS = this.readUInt32LE();
    this.skip(4);
    return {
      gameIdentifier,
      version,
      buildNo,
      replayLengthMS,
    };
  }

  private findParseStartOffset(): number {
    return this.buffer.indexOf("Warcraft III recorded game");
  }

  private parseHeader(): Header {
    const offset = this.findParseStartOffset();
    this.setOffset(offset);
    this.readZeroTermString("ascii");
    this.skip(4);
    const compressedSize = this.readUInt32LE();
    const headerVersion = this.readStringOfLength(4, "hex");
    const decompressedSize = this.readUInt32LE();
    const compressedDataBlockCount = this.readUInt32LE();

    return {
      decompressedSize,
      headerVersion,
      compressedDataBlockCount,
      compressedSize,
    };
  }
}
