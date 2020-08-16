import { Race } from "../types";

type ObjectIdStringencoded = {
  type: "stringencoded";
  value: string;
};

type ObjectIdAlphanumeric = {
  type: "alphanumeric";
  value: number[];
};

export type ItemId = ObjectIdAlphanumeric | ObjectIdStringencoded;

export const objectIdFormatter = (arr: number[]): ItemId => {
  if (arr[3] >= 0x41 && arr[3] <= 0x7a) {
    return {
      type: "stringencoded",
      value: arr
        .map((e) => String.fromCharCode(e as number))
        .reverse()
        .join(""),
    };
  }
  return { type: "alphanumeric", value: arr };
};

export const raceFlagFormatter = (flag: number): Race => {
  switch (flag) {
    case 0x01:
    case 0x41:
      return Race.Human;
    case 0x02:
    case 0x42:
      return Race.Orc;
    case 0x04:
    case 0x44:
      return Race.NightElf;
    case 0x08:
    case 0x48:
      return Race.Undead;
    case 0x20:
    case 0x60:
      return Race.Random;
  }
  return Race.Random;
};

export const chatModeFormatter = (flag: number): string => {
  switch (flag) {
    case 0x00:
      return "ALL";
    case 0x01:
      return "ALLY";
    case 0x02:
      return "OBS";
  }

  if (flag >= 3 && flag <= 27) {
    return `PRIVATE${flag}`;
  }

  return "UNKNOWN";
};
