import W3GReplay from "../../../src/W3GReplay";
import path from "path";
import { Platform } from "../../../src/types";
const Parser = new W3GReplay();
it("parses a reforged replay properly #1", () => {
  const test = Parser.parse(path.resolve(__dirname, "reforged1.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6091);
  expect(test.players.length).toBe(2);
});

it("parses a reforged replay properly #2", () => {
  const test = Parser.parse(path.resolve(__dirname, "reforged2.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6091);
  expect(test.players.length).toBe(2);
});

it("parses a replay with new reforged metadata successfully", () => {
  const test = Parser.parse(path.resolve(__dirname, "reforged2010.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6102);
  expect(test.players.length).toBe(6);
  expect(test.players[0].name).toBe("BEARAND#1604");
});

it("parses a reforged replay of version 1.32, build 6105 successfully", () => {
  const test = Parser.parse(path.resolve(__dirname, "reforged_release.w3g"));
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("anXieTy#2932");
  expect(test.players[1].name).toBe("IroNSoul#22724");
});

it("parses a replay with hunter2 as privateString between game name and encoded string successfully", () => {
  const test = Parser.parse(
    path.resolve(__dirname, "reforged_hunter2_privatestring.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("pischner#2950");
  expect(test.players[1].name).toBe("Wartoni#2638");
});

it("parses a netease 1.32 replay successfully", () => {
  const test = Parser.parse(
    path.resolve(__dirname, "netease_132.nwg"),
    Platform.BattleNet
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("HurricaneBo");
  expect(test.players[1].name).toBe("SimplyHunteR");
});

it("parse is a promise that resolves with parser output", async () => {
  const Parser = new W3GReplay();
  const timeslotBlocks = [];
  let completedAsyncDummyTask = false;
  Parser.on("timeslotblock", (TimeSlotBlock) => {
    timeslotBlocks.push(TimeSlotBlock);
  });
  setTimeout(() => {
    completedAsyncDummyTask = true;
  }, 0);
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "netease_132.nwg"),
    Platform.NetEase
  );
  expect(timeslotBlocks.length).toBeGreaterThan(50);
  expect(completedAsyncDummyTask).toBe(true);
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("HurricaneBo");
  expect(test.players[1].name).toBe("SimplyHunteR");
});