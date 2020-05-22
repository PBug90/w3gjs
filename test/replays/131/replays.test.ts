import W3GReplay from "../../../src/W3GReplay";
import path from "path";

const Parser = new W3GReplay();

it("parses a replay with action 0x7a successfully", () => {
  const test = Parser.parse(path.resolve(__dirname, "action0x7a.w3g"));
  expect(test.version).toBe("1.31");
  expect(test.players.length).toBe(1);
});

it("parses a standard 1.30.4 1on1 tome of retraining", () => {
  const test = Parser.parse(
    path.resolve(__dirname, "standard_tomeofretraining_1.w3g")
  );
  expect(test.version).toBe("1.31");
  expect(test.buildNumber).toBe(6072);
  expect(test.players.length).toBe(2);
  expect(test.players[0].heroes[0]).toEqual({
    id: "Hamg",
    abilities: {
      AHab: 2,
      AHbz: 2,
    },
    retrainingHistory: [
      {
        abilities: {
          AHab: 2,
          AHwe: 2,
        },
        time: 1136022,
      },
    ],
    level: 4,
    abilityOrder: [
      {
        time: 124366,
        type: "ability",
        value: "AHwe",
      },
      {
        time: 234428,
        type: "ability",
        value: "AHab",
      },
      {
        time: 293007,
        type: "ability",
        value: "AHwe",
      },
      {
        time: 1060007,
        type: "ability",
        value: "AHab",
      },
      {
        time: 1136022,
        type: "retraining",
      },
      {
        time: 1140944,
        type: "ability",
        value: "AHbz",
      },
      {
        time: 1141147,
        type: "ability",
        value: "AHbz",
      },
      {
        time: 1141460,
        type: "ability",
        value: "AHab",
      },
      {
        time: 1141569,
        type: "ability",
        value: "AHab",
      },
    ],
  });
});
