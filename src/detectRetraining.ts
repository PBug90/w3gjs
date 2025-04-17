import Player from "./Player";

const RETRAINING_DETECTION_TIME_RANGE = 60 * 1000;

export const getRetrainingIndex = (
  abilityOrder: Player["heroes"][number]["abilityOrder"],
  timeOfTomeOfRetrainingPurchase: number,
): number => {
  if (abilityOrder.length < 3) {
    return -1;
  }
  let candidateForFirstAbilityRelearnedAfterTomeUse = abilityOrder[0];
  let candidateForFirstAbilityRelearnedAfterTomeUseIndex = 0;
  let abilitiesLearnedInDetectionTimeRange = 0;
  for (let i = 1; i < abilityOrder.length; i++) {
    if (
      abilityOrder[i].time -
        candidateForFirstAbilityRelearnedAfterTomeUse.time <
      RETRAINING_DETECTION_TIME_RANGE
    ) {
      abilitiesLearnedInDetectionTimeRange++;
    } else {
      abilitiesLearnedInDetectionTimeRange = 0;
      candidateForFirstAbilityRelearnedAfterTomeUse = abilityOrder[i];
      candidateForFirstAbilityRelearnedAfterTomeUseIndex = i;
    }
    if (
      abilitiesLearnedInDetectionTimeRange === 2 &&
      candidateForFirstAbilityRelearnedAfterTomeUse.time -
        timeOfTomeOfRetrainingPurchase <=
        RETRAINING_DETECTION_TIME_RANGE
    ) {
      return candidateForFirstAbilityRelearnedAfterTomeUseIndex;
    }
  }
  return -1;
};
