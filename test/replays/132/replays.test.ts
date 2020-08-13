import W3GReplay from "../../../src/W3GReplay";
import path from "path";
import { GameDataBlock } from "../../../src/parsers/GameDataParser";
const Parser = new W3GReplay();
it("parses a reforged replay properly #1", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged1.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6091);
  expect(test.players.length).toBe(2);
});

it("parses a reforged replay properly #2", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged2.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6091);
  expect(test.players.length).toBe(2);
});

it("parses a replay with new reforged metadata successfully", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged2010.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6102);
  expect(test.players.length).toBe(6);
  expect(test.players[0].name).toBe("BEARAND#1604");
});

it("parses a reforged replay of version 1.32, build 6105 successfully", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged_release.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("anXieTy#2932");
  expect(test.players[1].name).toBe("IroNSoul#22724");
});

it("parses a replay with hunter2 as privateString between game name and encoded string successfully", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged_hunter2_privatestring.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("pischner#2950");
  expect(test.players[1].name).toBe("Wartoni#2638");
});

it("parses a netease 1.32 replay successfully", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "netease_132.nwg")
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
  Parser.on("gamedatablock", (block: GameDataBlock) => {
    if (block.id === 0x1f) {
      timeslotBlocks.push(block);
    }
  });
  setTimeout(() => {
    completedAsyncDummyTask = true;
  }, 0);
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "netease_132.nwg")
  );
  expect(timeslotBlocks.length).toBeGreaterThan(50);
  expect(completedAsyncDummyTask).toBe(true);
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("HurricaneBo");
  expect(test.players[1].name).toBe("SimplyHunteR");
});

it("handles truncated player names in reforged replays", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged_truncated_playernames.w3g")
  );
  expect(test.version).toBe("1.32");
  expect(test.buildNumber).toBe(6105);
  expect(test.players.length).toBe(2);
  expect(test.players[0].name).toBe("WaN#1734");
  expect(test.players[1].name).toBe("РозовыйПони#228941");
});

it("ignores a player entry in reforged extraPlayerList that misses in playerList", async () => {
  const test = await Parser.parseAsync(
    path.resolve(__dirname, "reforged_metadata_ghostplayer.w3g")
  );
  expect(test.players).toMatchSnapshot();
});
