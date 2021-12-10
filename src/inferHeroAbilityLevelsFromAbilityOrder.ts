import { Ability, Retraining } from "./Player";

const ultimates = new Set<string>().add("AEtq");

export function inferHeroAbilityLevelsFromAbilityOrder(
  abilityOrder: (Ability | Retraining)[]
): { [key: string]: number } {
  let abilities: { [key: string]: number } = {};
  for (const ability of abilityOrder) {
    if (ability.type === "ability") {
      if (ultimates.has(ability.value) && abilities[ability.value] === 1) {
        continue;
      }
      abilities[ability.value] = abilities[ability.value] || 0;
      if (abilities[ability.value] < 3) {
        abilities[ability.value]++;
      }
    }
    if (ability.type === "retraining") {
      abilities = {};
    }
  }
  return abilities;
}
