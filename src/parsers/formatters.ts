import { Parser } from "binary-parser";

type ObjectIdStringencoded = {
  type: "stringencoded";
  value: string;
};

type ObjectIdAlphanumeric = {
  type: "alphanumeric";
  value: number[];
};

export type ItemId = ObjectIdAlphanumeric | ObjectIdStringencoded;

export const objectIdFormatter = (arr: Parser.Data): ItemId => {
  const bla = arr as number[];
  if (bla[3] >= 0x41 && bla[3] <= 0x7a) {
    return {
      type: "stringencoded",
      value: bla
        .map((e) => String.fromCharCode(e as number))
        .reverse()
        .join(""),
    };
  }
  return { type: "alphanumeric", value: bla };
};

export const raceFlagFormatter = (flag: Parser.Data): string | Parser.Data => {
  switch (flag) {
    case 0x01:
    case 0x41:
      return "H";
    case 0x02:
    case 0x42:
      return "O";
    case 0x04:
    case 0x44:
      return "N";
    case 0x08:
    case 0x48:
      return "U";
    case 0x20:
    case 0x60:
      return "R";
  }
  return flag;
};

export const chatModeFormatter = (flag: Parser.Data): string | Parser.Data => {
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

  return flag;
};
