/*
  Parses actual game data
  Please note that TimeSlotBlocks do not fully parse included actions.
  They should be parsed block by block manually
  afterwards to ensure proper error handling.
*/

import { Parser } from "binary-parser";
import { CommandDataBlock } from "./actions";
import { chatModeFormatter } from "./formatters";

// 0x17
const LeaveGameBlock = new Parser()
  .string("reason", { length: 4, encoding: "hex" })
  .int8("playerId")
  .string("result", { length: 4, encoding: "hex" })
  .skip(4);

// 0x1A
const FirstStartBlock = new Parser().skip(4);

// 0x1B
const SecondStartBlock = new Parser().skip(4);

// 0x1C
const ThirdStartBlock = new Parser().skip(4);

// 0x1F 0x1E
const TimeSlotBlock = new Parser()
  .int16le("byteCount")
  .int16le("timeIncrement")
  .array("actions", {
    type: CommandDataBlock,
    lengthInBytes() {
      // @ts-ignore
      return this.byteCount - 2;
    },
  });

// 0x20
const PlayerChatMessageBlock = new Parser()
  .int8("playerId")
  .int16le("byteCount")
  .int8("flags")
  .choice("", {
    tag: "flags",
    choices: {
      0x10: new Parser(),
      0x20: new Parser()
        .int8("mode", {
          formatter: chatModeFormatter,
        })
        .skip(3),
    },
  })
  .string("message", { zeroTerminated: true, encoding: "utf8" });

// 0x22
const Unknown0x22 = new Parser()
  .uint8("length")
  .string("content", { length: "length" });

// 0x23
const Unknown0x23 = new Parser().skip(10);

// 0x2F
const ForcedGameEndCountdown = new Parser().skip(8);

const GameData = new Parser().uint8("id").choice("", {
  tag: "id",
  choices: {
    0x17: LeaveGameBlock,
    0x1a: FirstStartBlock,
    0x1b: SecondStartBlock,
    0x1c: ThirdStartBlock,
    0x1f: TimeSlotBlock,
    0x1e: TimeSlotBlock,
    0x20: PlayerChatMessageBlock,
    0x22: Unknown0x22,
    0x23: Unknown0x23,
    0x2f: ForcedGameEndCountdown,
    0: new Parser(),
  },
});

const GameDataParser = new Parser().array("blocks", {
  type: GameData,
  readUntil: "eof",
});

export type LeaveGameBlockType = ReturnType<typeof LeaveGameBlock.parse> & {
  id: 0x17;
};

export type FirstStartBlockType = ReturnType<typeof FirstStartBlock.parse> & {
  id: 0x1a;
};

export type SecondStartBlockType = ReturnType<typeof SecondStartBlock.parse> & {
  id: 0x1b;
};

export type ThirdStartBlockType = ReturnType<typeof ThirdStartBlock.parse> & {
  id: 0x1c;
};

export type TimeSlotBlockOldType = ReturnType<typeof TimeSlotBlock.parse> & {
  id: 0x1f;
};

export type TimeSlotBlockNewType = ReturnType<typeof TimeSlotBlock.parse> & {
  id: 0x1e;
};

export type PlayerChatMessageBlockType = ReturnType<
  typeof PlayerChatMessageBlock.parse
> & { id: 0x20 };

export type Unknown0x22Type = ReturnType<typeof Unknown0x22.parse> & {
  id: 0x22;
};

export type Unknown0x23Type = ReturnType<typeof Unknown0x23.parse> & {
  id: 0x23;
};

export type ForcedGameEndCountdownType = ReturnType<
  typeof ForcedGameEndCountdown.parse
> & { id: 0x2f };

export type GameDataBlockType =
  | LeaveGameBlockType
  | FirstStartBlockType
  | SecondStartBlockType
  | ThirdStartBlockType
  | TimeSlotBlockOldType
  | TimeSlotBlockNewType
  | PlayerChatMessageBlockType
  | Unknown0x22Type
  | Unknown0x23Type
  | ForcedGameEndCountdownType;

export { GameDataParser };
