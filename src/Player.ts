import convert from "./convert";
import { items, units, buildings, upgrades, abilityToHero } from "./mappings";
import { Race, ItemID } from "./types";
import { TransferResourcesActionWithPlayer } from "./W3GReplay";
import { Action } from "./parsers/ActionParser";

const isRightclickAction = (input: number[]) =>
  input[0] === 0x03 && input[1] === 0;
const isBasicAction = (input: number[]) => input[0] <= 0x19 && input[1] === 0;

type TransferResourcesActionWithPlayerAndTimestamp = {
  msElapsed: number;
} & TransferResourcesActionWithPlayer;

export const reduceHeroes = (heroCollector: {
  [key: string]: HeroInfo;
}): Omit<HeroInfo, "order">[] => {
  return Object.values(heroCollector)
    .sort((h1, h2) => h1.order - h2.order)
    .reduce((aggregator, hero) => {
      hero.level = Object.values(hero.abilities).reduce(
        (prev, curr) => prev + curr,
        0
      );
      const { order, ...heroWithoutOrder } = hero;
      aggregator.push(heroWithoutOrder);
      return aggregator;
    }, [] as Omit<HeroInfo, "order">[]);
};

export interface Ability {
  type: "ability";
  time: number;
  value: string;
}

export interface Retraining {
  type: "retraining";
  time: number;
}

export interface HeroInfo {
  level: number;
  abilities: { [key: string]: number };
  order: number;
  id: string;
  retrainingHistory: { time: number; abilities: { [key: string]: number } }[];
  abilityOrder: (Ability | Retraining)[];
}

class Player {
  id: number;
  name: string;
  teamid: number;
  color: string;
  race: Race;
  raceDetected: string;
  units: {
    summary: { [key: string]: number };
    order: { id: string; ms: number }[];
  };
  upgrades: {
    summary: { [key: string]: number };
    order: { id: string; ms: number }[];
  };
  items: {
    summary: { [key: string]: number };
    order: { id: string; ms: number }[];
  };

  buildings: {
    summary: { [key: string]: number };
    order: { id: string; ms: number }[];
  };
  heroes: Omit<HeroInfo, "order">[];
  heroCollector: { [key: string]: HeroInfo };
  heroCount: number;
  actions: {
    timed: number[];
    assigngroup: number;
    rightclick: number;
    basic: number;
    buildtrain: number;
    ability: number;
    item: number;
    select: number;
    removeunit: number;
    subgroup: number;
    selecthotkey: number;
    esc: number;
  };
  groupHotkeys: {
    [key: number]: { assigned: number; used: number };
  };
  resourceTransfers: TransferResourcesActionWithPlayerAndTimestamp[] = [];
  _currentlyTrackedAPM: number;
  _retrainingMetadata: { [key: string]: { start: number; end: number } };
  _lastRetrainingTime: number;
  _lastActionWasDeselect: boolean;
  currentTimePlayed: number;
  apm: number;

  constructor(
    id: number,
    name: string,
    teamid: number,
    color: number,
    race: Race
  ) {
    this.id = id;
    this.name = name;
    this.teamid = teamid;
    this.color = convert.playerColor(color);
    this.race = race;
    this.raceDetected = "";
    this.units = { summary: {}, order: [] };
    this.upgrades = { summary: {}, order: [] };
    this.items = { summary: {}, order: [] };
    this.buildings = { summary: {}, order: [] };
    this.heroes = [];
    this.heroCollector = {};
    this.resourceTransfers = [];
    this.heroCount = 0;
    this.actions = {
      timed: [],
      assigngroup: 0,
      rightclick: 0,
      basic: 0,
      buildtrain: 0,
      ability: 0,
      item: 0,
      select: 0,
      removeunit: 0,
      subgroup: 0,
      selecthotkey: 0,
      esc: 0,
    };
    this.groupHotkeys = {
      1: { assigned: 0, used: 0 },
      2: { assigned: 0, used: 0 },
      3: { assigned: 0, used: 0 },
      4: { assigned: 0, used: 0 },
      5: { assigned: 0, used: 0 },
      6: { assigned: 0, used: 0 },
      7: { assigned: 0, used: 0 },
      8: { assigned: 0, used: 0 },
      9: { assigned: 0, used: 0 },
      0: { assigned: 0, used: 0 },
    };
    this._currentlyTrackedAPM = 0;
    this._lastActionWasDeselect = false;
    this._retrainingMetadata = {};
    this._lastRetrainingTime = 0;
    this.currentTimePlayed = 0;
    this.apm = 0;
  }

  newActionTrackingSegment(timeTrackingInterval = 60000): void {
    this.actions.timed.push(
      Math.floor(this._currentlyTrackedAPM * (60000.0 / timeTrackingInterval))
    );
    this._currentlyTrackedAPM = 0;
  }

  detectRaceByActionId(actionId: string): void {
    switch (actionId[0]) {
      case "e":
        this.raceDetected = "N";
        break;
      case "o":
        this.raceDetected = "O";
        break;
      case "h":
        this.raceDetected = "H";
        break;
      case "u":
        this.raceDetected = "U";
        break;
    }
  }

  handleStringencodedItemID(actionId: string, gametime: number): void {
    if (units[actionId]) {
      this.units.summary[actionId] = this.units.summary[actionId] + 1 || 1;
      this.units.order.push({ id: actionId, ms: gametime });
    } else if (items[actionId]) {
      this.items.summary[actionId] = this.items.summary[actionId] + 1 || 1;
      this.items.order.push({ id: actionId, ms: gametime });
    } else if (buildings[actionId]) {
      this.buildings.summary[actionId] =
        this.buildings.summary[actionId] + 1 || 1;
      this.buildings.order.push({ id: actionId, ms: gametime });
    } else if (upgrades[actionId]) {
      this.upgrades.summary[actionId] =
        this.upgrades.summary[actionId] + 1 || 1;
      this.upgrades.order.push({ id: actionId, ms: gametime });
    }
  }

  handleHeroSkill(actionId: string, gametime: number): void {
    const heroId = abilityToHero[actionId];
    if (this.heroCollector[heroId] === undefined) {
      this.heroCount += 1;
      this.heroCollector[heroId] = {
        level: 0,
        abilities: {},
        order: this.heroCount,
        id: heroId,
        abilityOrder: [],
        retrainingHistory: [],
      };
    }

    if (this._lastRetrainingTime > 0) {
      this.heroCollector[heroId].retrainingHistory.push({
        time: this._lastRetrainingTime,
        abilities: this.heroCollector[heroId].abilities,
      });
      this.heroCollector[heroId].abilities = {};
      this.heroCollector[heroId].abilityOrder.push({
        type: "retraining",
        time: this._lastRetrainingTime,
      });
      this._lastRetrainingTime = 0;
    }
    this.heroCollector[heroId].abilities[actionId] =
      this.heroCollector[heroId].abilities[actionId] || 0;
    this.heroCollector[heroId].abilities[actionId] += 1;
    this.heroCollector[heroId].abilityOrder.push({
      type: "ability",
      time: gametime,
      value: actionId,
    });
  }

  handleRetraining(gametime: number): void {
    this._lastRetrainingTime = gametime;
  }

  handle0x10(itemid: ItemID, gametime: number): void {
    switch (itemid.value[0]) {
      case "A":
        this.handleHeroSkill(itemid.value as string, gametime);
        break;
      case "R":
        this.handleStringencodedItemID(itemid.value as string, gametime);
        break;
      case "u":
      case "e":
      case "h":
      case "o":
        if (!this.raceDetected) {
          this.detectRaceByActionId(itemid.value as string);
        }
        this.handleStringencodedItemID(itemid.value as string, gametime);
        break;
      default:
        this.handleStringencodedItemID(itemid.value as string, gametime);
    }

    itemid.value[0] !== "0"
      ? this.actions.buildtrain++
      : this.actions.ability++;

    this._currentlyTrackedAPM++;
  }

  handle0x11(itemid: ItemID, gametime: number): void {
    this._currentlyTrackedAPM++;
    if (itemid.type === "alphanumeric") {
      if (itemid.value[0] <= 0x19 && itemid.value[1] === 0) {
        this.actions.basic++;
      } else {
        this.actions.ability++;
      }
    } else {
      this.handleStringencodedItemID(itemid.value as string, gametime);
    }
  }

  handle0x12(itemid: ItemID): void {
    if (isRightclickAction(itemid.value as number[])) {
      this.actions.rightclick++;
    } else if (isBasicAction(itemid.value as number[])) {
      this.actions.basic++;
    } else {
      this.actions.ability++;
    }
    this._currentlyTrackedAPM++;
  }

  handle0x13(): void {
    this.actions.item++;
    this._currentlyTrackedAPM++;
  }

  handle0x14(itemid: ItemID): void {
    if (isRightclickAction(itemid.value as number[])) {
      this.actions.rightclick++;
    } else if (isBasicAction(itemid.value as number[])) {
      this.actions.basic++;
    } else {
      this.actions.ability++;
    }
    this._currentlyTrackedAPM++;
  }

  handle0x16(selectMode: number, isAPM: boolean): void {
    if (isAPM) {
      this.actions.select++;
      this._currentlyTrackedAPM++;
    }
  }

  handle0x51(action: TransferResourcesActionWithPlayer): void {
    this.resourceTransfers.push({
      ...action,
      msElapsed: this.currentTimePlayed,
    });
  }

  handleOther(action: Action): void {
    switch (action.id) {
      case 0x17:
        this.actions.assigngroup++;
        this._currentlyTrackedAPM++;
        this.groupHotkeys[(action.groupNumber + 1) % 10].assigned++;
        break;
      case 0x18:
        this.actions.selecthotkey++;
        this._currentlyTrackedAPM++;
        this.groupHotkeys[(action.groupNumber + 1) % 10].used++;
        break;
      case 0x1c:
      case 0x1d:
      case 0x66:
      case 0x67:
        this._currentlyTrackedAPM++;
        break;
      case 0x1e:
        this.actions.removeunit++;
        this._currentlyTrackedAPM++;
        break;
      case 0x61:
        this.actions.esc++;
        this._currentlyTrackedAPM++;
        break;
    }
  }

  cleanup(): void {
    const apmSum = this.actions.timed.reduce(
      (a: number, b: number): number => a + b
    );
    if (this.currentTimePlayed === 0) {
      this.apm = 0;
    } else {
      this.apm = Math.round(apmSum / (this.currentTimePlayed / 1000 / 60));
    }
    this.heroes = reduceHeroes(this.heroCollector);
  }

  toJSON(): Partial<Player> {
    return {
      actions: this.actions,
      groupHotkeys: this.groupHotkeys,
      buildings: this.buildings,
      items: this.items,
      units: this.units,
      upgrades: this.upgrades,
      color: this.color,
      heroes: this.heroes,
      name: this.name,
      race: this.race,
      raceDetected: this.raceDetected,
      teamid: this.teamid,
      apm: this.apm,
      id: this.id,
      resourceTransfers: this.resourceTransfers,
    };
  }
}

export default Player;
