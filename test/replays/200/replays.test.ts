import W3GReplay from "../../../src";
import path from "path";

const Parser = new W3GReplay();

it("recognizes a 'build haunted gold mine' command correctly and adds it to the player's buildings", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "goldmine test.w3g"));
  expect(test.players[0].buildings.summary).toHaveProperty("ugol", 1);
  expect(test.players[0].buildings.order).toEqual([{ id: "ugol", ms: 28435 }]);
});

it("identifies game version 2 and sets the version number to 2.00", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "goldmine test.w3g"));
  expect(test.version).toBe("2.00");
});

it("#191 parses a custom map using UI components encoded in actions successfully and without logging errors", async () => {
  const consoleSpy = jest.spyOn(console, "log");
  const test = await Parser.parse(path.resolve(__dirname, "TempReplay.w3g"));
  expect(test.version).toBe("2.00");
  expect(consoleSpy).not.toHaveBeenCalled();
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
});
