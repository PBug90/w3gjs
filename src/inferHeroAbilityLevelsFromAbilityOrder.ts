import { Ability, Retraining } from "./Player";

const ultimates = new Set<string>()
  .add("AEtq")
  .add("AEme")
  .add("AEsf")
  .add("AEsv")
  .add("AOww")
  .add("AOeq")
  .add("AOre")
  .add("AOvd")
  .add("AUan")
  .add("AUin")
  .add("AUdd")
  .add("AUls")
  .add("ANef")
  .add("ANch")
  .add("ANto")
  .add("ANdo")
  .add("ANst")
  .add("ANrg")
  .add("ANg1")
  .add("ANg2")
  .add("ANg3")
  .add("ANvc")
  .add("ANtm")
  .add("AHmt")
  .add("AHav")
  .add("AHre")
  .add("AHpx");

export function inferHeroAbilityLevelsFromAbilityOrder(
  abilityOrder: (Ability | Retraining)[],
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
