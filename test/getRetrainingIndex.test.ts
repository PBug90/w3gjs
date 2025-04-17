import { getRetrainingIndex } from "../src/detectRetraining";
import Player from "../src/Player";

it("detects a retraining successfully", () => {
  const retrainedAbilityOrder: Player["heroes"][number]["abilityOrder"] = [
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
  ];
  expect(getRetrainingIndex(retrainedAbilityOrder, 1399843)).toBe(6);
});

it("returns -1 for test case 1", () => {
  const expectedFalse: Player["heroes"][number]["abilityOrder"] = [
    {
      type: "ability",
      time: 141559,
      value: "ANsg",
    },
    {
      type: "ability",
      time: 372693,
      value: "ANsg",
    },
    {
      type: "ability",
      time: 523758,
      value: "ANsw",
    },
    {
      type: "ability",
      time: 523879,
      value: "ANsw",
    },
    {
      type: "ability",
      time: 701002,
      value: "ANsg",
    },
    {
      type: "ability",
      time: 1080754,
      value: "ANst",
    },
    {
      type: "ability",
      time: 1468279,
      value: "ANsw",
    },
  ];
  expect(getRetrainingIndex(expectedFalse, 1399843)).toBe(-1);
});

it("returns -1 for test case 2", () => {
  const expectedFalse: Player["heroes"][number]["abilityOrder"] = [
    {
      type: "ability",
      time: 631947,
      value: "ANbf",
    },
    {
      type: "ability",
      time: 689454,
      value: "ANdh",
    },
    {
      type: "ability",
      time: 910900,
      value: "ANbf",
    },
    {
      type: "ability",
      time: 1069108,
      value: "ANdb",
    },
    {
      type: "ability",
      time: 1240983,
      value: "ANbf",
    },
  ];

  expect(getRetrainingIndex(expectedFalse, 1399843)).toBe(-1);
});

it("returns -1 for test case 3", () => {
  const expectedFalse: Player["heroes"][number]["abilityOrder"] = [
    {
      type: "ability",
      time: 1236109,
      value: "ANsi",
    },
    {
      type: "ability",
      time: 1458928,
      value: "ANba",
    },
  ];
  expect(getRetrainingIndex(expectedFalse, 1399843)).toBe(-1);
});

it("returns -1 for test case 4", () => {
  const expectedFalse: Player["heroes"][number]["abilityOrder"] = [
    {
      type: "ability",
      time: 603355,
      value: "AHtb",
    },
    {
      type: "ability",
      time: 700216,
      value: "AHbh",
    },
    {
      type: "ability",
      time: 812728,
      value: "AHtb",
    },
    {
      type: "ability",
      time: 978714,
      value: "AHbh",
    },
    {
      type: "ability",
      time: 1396510,
      value: "AHtc",
    },
  ];
  expect(getRetrainingIndex(expectedFalse, 1399843)).toBe(-1);
});

it("returns -1 for test case 5", () => {
  const expectedFalse: Player["heroes"][number]["abilityOrder"] = [
    {
      type: "ability",
      time: 905886,
      value: "AHhb",
    },
    {
      type: "ability",
      time: 1028782,
      value: "AHds",
    },
    {
      type: "ability",
      time: 1404045,
      value: "AHhb",
    },
    {
      type: "ability",
      time: 1510753,
      value: "AHad",
    },
  ];
  expect(getRetrainingIndex(expectedFalse, 1399843)).toBe(-1);
});
