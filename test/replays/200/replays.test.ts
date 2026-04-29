import { readFileSync } from "fs";
import W3GReplay, { MetadataParser, RawParser } from "../../../src";
import path from "node:path";
const Parser = new W3GReplay();

const consoleLogSpy = jest.spyOn(console, "log");
const consoleErrorSpy = jest.spyOn(console, "error");

it("recognizes a 'build haunted gold mine' command correctly and adds it to the player's buildings", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "goldmine test.w3g"));
  expect(test.players[0].buildings.summary).toHaveProperty("ugol", 1);
  expect(test.players[0].buildings.order).toEqual([{ id: "ugol", ms: 28435 }]);
  expect(test.winningTeamId).toBe(0);
  expect(test.players.find((p) => p.teamid === test.winningTeamId)!.name).toBe(
    "anXieTy#2932",
  );
});

it("identifies game version 2 and sets the version number to 2.00", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "goldmine test.w3g"));
  expect(test.version).toBe("2.00");
  expect(test.winningTeamId).toBe(0);
  expect(test.players.find((p) => p.teamid === test.winningTeamId)!.name).toBe(
    "anXieTy#2932",
  );
});

it("#191 parses a custom map using UI components encoded in actions successfully and without logging errors", async () => {
  const consoleSpy = jest.spyOn(console, "log");
  const test = await Parser.parse(path.resolve(__dirname, "TempReplay.w3g"));
  expect(test.version).toBe("2.00");
  expect(consoleSpy).not.toHaveBeenCalled();
  expect(test.winningTeamId).toBe(-1);
});

it("detects retraining", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "retrainingissues.w3g"),
  );
  expect(test.version).toBe("2.00");
  expect(test.players[1].heroes[0].abilityOrder).toEqual([
    {
      type: "ability",
      time: 125743,
      value: "AHwe",
    },
    {
      type: "ability",
      time: 167347,
      value: "AHab",
    },
    {
      type: "ability",
      time: 230430,
      value: "AHwe",
    },
    {
      type: "ability",
      time: 543939,
      value: "AHab",
    },
    {
      type: "ability",
      time: 818999,
      value: "AHwe",
    },
    {
      type: "ability",
      time: 1211048,
      value: "AHmt",
    },
    { type: "retraining", time: 1399843 },
    {
      type: "ability",
      time: 1443410,
      value: "AHbz",
    },
    {
      type: "ability",
      time: 1443563,
      value: "AHbz",
    },
    {
      type: "ability",
      time: 1443685,
      value: "AHbz",
    },
    {
      type: "ability",
      time: 1444048,
      value: "AHab",
    },
    {
      type: "ability",
      time: 1444231,
      value: "AHab",
    },
    {
      type: "ability",
      time: 1444384,
      value: "AHmt",
    },
  ]);
  expect(test.players[1].heroes[0].level).toBe(6);
  expect(test.winningTeamId).toBe(0);
  expect(test.players.find((p) => p.teamid === test.winningTeamId)!.name).toBe(
    "Cechi#21571",
  );
});

it("parses 2.0.2 replay Reforged data successfully and without logging errors", async () => {
  const rawParser = new RawParser();
  const file = readFileSync(path.resolve(__dirname, "2.0.2-LAN-bots.w3g"));
  const data = await rawParser.parse(file);

  const metadataParser = new MetadataParser();
  const metadata = await metadataParser.parse(data.blocks);

  expect(metadata.reforgedPlayerMetadata).toBeDefined();
  expect(metadata.reforgedPlayerMetadata.length).toBeGreaterThan(0);

  expect(data.subheader.version).toBe(10100);
  expect(consoleLogSpy).not.toHaveBeenCalled();
});

it("parses 2.0.2 melee replay with chat successfully and without logging errors", async () => {
  const parser = new W3GReplay();
  await parser.parse(path.resolve(__dirname, "2.0.2-Melee.w3g"));

  expect(parser.chatlog[0].playerId).toBe(1);
  expect(parser.chatlog[0].message).toBe("don't hurt me");
  expect(parser.chatlog[1].playerId).toBe(2);
  expect(parser.chatlog[1].message).toBe("no more");

  expect(consoleLogSpy).not.toHaveBeenCalled();
  expect(parser.winningTeamId).toBe(0);
  expect(
    Object.values(parser.players).find(
      (p) => p.teamid === parser.winningTeamId,
    )!.name,
  ).toBe("BogdanW4");
});

it("parses 2.0.2 flotv game successfully that was saved with WC3", async () => {
  const parser = new W3GReplay();
  const test = await parser.parse(
    path.resolve(__dirname, "2.0.2-FloTVSavedByWc3.w3g"),
  );
  expect(consoleLogSpy).not.toHaveBeenCalled();
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  expect(test.winningTeamId).toBe(0);
  expect(test.players.find((p) => p.teamid === test.winningTeamId)!.name).toBe(
    "DeMusliM#21529",
  );
});

describe("winner detection", () => {
  it("detects LeonXIV#21701 as winner of 148249993_Edo_Leon_Tidehunters 12.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "148249993_Edo_Leon_Tidehunters 12.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("LeonXIV#21701");
  });

  it("detects LeonXIV#21701 as winner of 791786117_Edo_Leon_Springtime 13.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "791786117_Edo_Leon_Springtime 13.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("LeonXIV#21701");
  });

  it("detects Changer#21493 as winner of 455872485_PhoeNix_Changer_Hammerfall.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "455872485_PhoeNix_Changer_Hammerfall.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("Changer#21493");
  });

  it("detects Changer#21493 as winner of 2661392198_PhoeNix_Changer_Concealed Hill.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "2661392198_PhoeNix_Changer_Concealed Hill.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("Changer#21493");
  });

  it("detects DorraNi#2523 as winner of 3320738873_Changer_PhoeNix_Springtime 13.w3g", async () => {
    const test = await Parser.parse(
      path.resolve(__dirname, "3320738873_Changer_PhoeNix_Springtime 13.w3g"),
    );
    expect(test.winningTeamId).toBe(1);
    expect(
      test.players.find((player) => player.teamid === test.winningTeamId)!.name,
    ).toBe("DorraNi#2523");
  });
});
