import W3GReplay from "./W3GReplay";
import { ConcurrentParsingNotSupportedError } from "./errors";

import GameDataParser from "./parsers/GameDataParser";
import MetadataParser from "./parsers/MetadataParser";
import RawParser, {
  type DataBlock,
  getUncompressedData,
} from "./parsers/RawParser";
import ReplayParser from "./parsers/ReplayParser";

export default W3GReplay;
export {
  GameDataParser,
  MetadataParser,
  RawParser,
  ReplayParser,
  getUncompressedData,
  ConcurrentParsingNotSupportedError,
  type DataBlock,
};
