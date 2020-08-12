import RawParser, { Header, SubHeader } from "./RawParser";
import MetadataParser, { ReplayMetadata } from "./MetadataParser";
import GameDataParser from "./GameDataParser";
import { EventEmitter } from "events";
import { GameDataBlockType, TimeSlotBlockNewType } from "../parsers/gamedata";
import { CommandDataBlockType, ActionType } from "../parsers/actions";

export type ParserOutput = {
  header: Header;
  subheader: SubHeader;
  metadata: ReplayMetadata;
};

export type BasicReplayInformation = ParserOutput;

export default interface ReplayParser {
  on(
    event: "gamedatablock",
    listener: (block: GameDataBlockType) => void
  ): this;
  on(
    event: "timeslotblock",
    listener: (block: TimeSlotBlockNewType) => void
  ): this;
  on(
    event: "commandblock",
    listener: (block: CommandDataBlockType) => void
  ): this;
  on(
    event: "actionblock",
    listener: (block: ActionType, playerId: number) => void
  ): this;
  on(
    event: "basic_replay_information",
    listener: (data: BasicReplayInformation) => void
  ): this;
}

export default class ReplayParser extends EventEmitter {
  private rawParser: RawParser = new RawParser();
  private metadataParser: MetadataParser = new MetadataParser();
  private gameDataParser: GameDataParser = new GameDataParser();

  constructor() {
    super();
    this.gameDataParser.on("gamedatablock", (block: GameDataBlockType) =>
      this.emit("gamedatablock", block)
    );
    this.gameDataParser.on("timeslotblock", (block: TimeSlotBlockNewType) =>
      this.emit("timeslotblock", block)
    );
    this.gameDataParser.on("commandblock", (block: CommandDataBlockType) =>
      this.emit("commandblock", block)
    );

    this.gameDataParser.on(
      "actionblock",
      (block: ActionType, playerId: number) =>
        this.emit("actionblock", block, playerId)
    );
  }

  async parse(input: Buffer): Promise<ParserOutput> {
    const rawParserResult = await this.rawParser.parse(input);
    const metadataParserResult = await this.metadataParser.parse(
      rawParserResult.blocks
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
