import W3GReplay from "./W3GReplay.js";
import { ConcurrentParsingNotSupportedError } from "./errors.js";

import GameDataParser from "./parsers/GameDataParser.js";
import MetadataParser from "./parsers/MetadataParser.js";
import RawParser, {
  type DataBlock,
  getUncompressedData,
} from "./parsers/RawParser.js";
import ReplayParser from "./parsers/ReplayParser.js";

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
