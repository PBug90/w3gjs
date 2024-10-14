import RawParser, { Header, SubHeader } from "./RawParser";
import MetadataParser, { ReplayMetadata } from "./MetadataParser";
import GameDataParser, { GameDataBlock } from "./GameDataParser";
import { EventEmitter } from "events";

export type ParserOutput = {
  header: Header;
  subheader: SubHeader;
  metadata: ReplayMetadata;
};

export type BasicReplayInformation = ParserOutput;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export default interface ReplayParser {
  on(event: "gamedatablock", listener: (block: GameDataBlock) => void): this;
  on(
    event: "basic_replay_information",
    listener: (data: BasicReplayInformation) => void,
  ): this;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export default class ReplayParser extends EventEmitter {
  private rawParser: RawParser = new RawParser();
  private metadataParser: MetadataParser = new MetadataParser();
  private gameDataParser: GameDataParser = new GameDataParser();

  constructor() {
    super();
    this.gameDataParser.on("gamedatablock", (block: GameDataBlock) =>
      this.emit("gamedatablock", block),
    );
  }

  async parse(input: Buffer): Promise<ParserOutput> {
    const rawParserResult = await this.rawParser.parse(input);
    const metadataParserResult = await this.metadataParser.parse(
      rawParserResult.blocks,
    );
    const result: ParserOutput = {
      header: rawParserResult.header,
      subheader: rawParserResult.subheader,
      metadata: metadataParserResult,
    };
    this.emit("basic_replay_information", {
      header: rawParserResult.header,
      subheader: rawParserResult.subheader,
      metadata: metadataParserResult,
    });
    await this.gameDataParser.parse(metadataParserResult.gameData);

    return result;
  }
}
