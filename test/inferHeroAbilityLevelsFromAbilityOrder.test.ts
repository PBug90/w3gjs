import { inferHeroAbilityLevelsFromAbilityOrder } from "../src/inferHeroAbilityLevelsFromAbilityOrder";
import Player, { Ability } from "../src/Player";

const input: Ability[] = [
  {
    type: "ability",
    time: 126467,
    value: "AEfn",
  },
  {
    type: "ability",
    time: 178541,
    value: "AEer",
  },
  {
    type: "ability",
    time: 534905,
    value: "AEfn",
  },
  {
    type: "ability",
    time: 1016408,
    value: "AEer",
  },
  {
    type: "ability",
    time: 1907059,
    value: "AEer",
  },
  {
    type: "ability",
    time: 2091683,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093068,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093226,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093357,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093505,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093617,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093738,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2093847,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2094002,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2094137,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2094271,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2094393,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2094526,
    value: "AEtq",
  },
  {
    type: "ability",
    time: 2094671,
    value: "AEtq",
  },
];

it("correctly infers that KOTG only has tranquility level 1", () => {
  expect(inferHeroAbilityLevelsFromAbilityOrder(input)).toEqual({
    finalHeroAbilities: {
      AEfn: 2,
      AEer: 3,
      AEtq: 1,
    },
    retrainingHistory: [],
  });
});

it("correctly infers the final ability levels and the ability state before tome of retraining was used", () => {
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
  ];
  expect(inferHeroAbilityLevelsFromAbilityOrder(retrainedAbilityOrder)).toEqual(
    {
      finalHeroAbilities: {
        AHbz: 3,
        AHab: 2,
        AHmt: 1,
      },
      retrainingHistory: [
        {
          abilities: {
            AHab: 2,
            AHmt: 1,
            AHwe: 3,
          },
          time: 1399843,
        },
      ],
    },
  );
});
