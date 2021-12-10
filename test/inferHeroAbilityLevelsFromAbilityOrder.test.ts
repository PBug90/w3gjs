import { inferHeroAbilityLevelsFromAbilityOrder } from "../src/inferHeroAbilityLevelsFromAbilityOrder";
import { Ability } from "../src/Player";

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
    AEfn: 2,
    AEer: 3,
    AEtq: 1,
  });
});
