import StatefulBufferParser from "./StatefulBufferParser";

type NetTag = [number, number];
type Vec2 = [number, number];

type UnitBuildingAbilityActionNoParams = {
  id: 0x10;
  abilityFlags: number;
  orderId: number[];
};

type UnitBuildingAbilityActionTargetPosition = {
  id: 0x11;
  abilityFlags: number;
  orderId: number[];
  target: Vec2;
};

type UnitBuildingAbilityActionTargetPositionTargetObjectId = {
  id: 0x12;
  abilityFlags: number;
  orderId: number[];
  target: Vec2;
  object: NetTag;
};

type GiveItemToUnitAciton = {
  id: 0x13;
  abilityFlags: number;
  orderId: number[];
  target: Vec2;
  unit: NetTag;
  item: NetTag;
};

type UnitBuildingAbilityActionTwoTargetPositions = {
  id: 0x14;
  abilityFlags: number;
  orderId1: number[];
  targetA: Vec2;
  orderId2: number[];
  flags: number;
  category: number;
  owner: number;
  targetB: Vec2;
};

type UnitBuildingAbilityActionTargetPositionTargetObjectIdItemObjectId = {
  id: 0x15;
  abilityFlags: number;
  orderId1: number[];
  targetA: Vec2;
  orderId2: number[];
  flags: number;
  category: number;
  owner: number;
  targetB: Vec2;
  object: NetTag;
};

type ChangeSelectionAction = {
  id: 0x16;
  selectMode: number;
  numberUnits: number;
  units: NetTag[];
};

type AssignGroupHotkeyAction = {
  id: 0x17;
  groupNumber: number;
  numberUnits: number;
  units: NetTag[];
};

type SelectGroupHotkeyAction = {
  id: 0x18;
  groupNumber: number;
};

type SelectSubgroupAction = {
  id: 0x19;
  itemId: number[];
  object: NetTag;
};

type PreSubselectionAction = {
  id: 0x1a;
};

type SelectUnitAction = {
  id: 0x1b;
  object: NetTag;
};

type SelectGroundItemAction = {
  id: 0x1c;
  item: NetTag;
};

type CancelHeroRevival = {
  id: 0x1d;
  hero: NetTag;
};

type RemoveUnitFromBuildingQueue = {
  id: 0x1e | 0x1f;
  slotNumber: number;
  itemId: number[];
};

export type TransferResourcesAction = {
  id: 0x51;
  slot: number;
  gold: number;
  lumber: number;
};

type ESCPressedAction = {
  id: 0x61;
};

type ChooseHeroSkillSubmenu = {
  id: 0x66;
};

type EnterBuildingSubmenu = {
  id: 0x67;
};

type Cache = {
  filename: string;
  missionKey: string;
  key: string;
};

type BlzCacheStoreIntAction = {
  id: 0x6b;
  cache: Cache;
  value: number;
};

export type W3MMDAction = BlzCacheStoreIntAction;

type BlzCacheStoreRealAction = {
  id: 0x6c;
  cache: Cache;
  value: number;
};

type BlzCacheStoreBooleanAction = {
  id: 0x6d;
  cache: Cache;
  value: number;
};

export type Item = {
  itemId: number[];
  charges: number;
  flags: number;
};

export type Ability = {
  id: number[];
  level: number;
};

type HeroData = {
  xp: number;
  level: number;
  skillPoints: number;
  properNameId: number;
  str: number;
  strBonus: number; //float
  agi: number;
  speedMod: number; //float
  cooldownMod: number; //float
  agiBonus: number; //float
  intel: number;
  intBonus: number; //float
  heroAbils: Ability[];
  maxLife: number; //float
  maxMana: number; //float
  // >= 6030
  sight: number; //float
  damage: number[]; //int[]
  defense: number; //float
  // >= 6031
  controlGroups: number; //int16
};

export type Unit = {
  unitId: number[];
  items: Item[];
  heroData: HeroData;
};

type BlzCacheStoreUnitAction = {
  id: 0x6e;
  cache: Cache;
  value: Unit;
};

type BlzCacheClearIntAction = {
  id: 0x70;
  cache: Cache;
};

type BlzCacheClearRealAction = {
  id: 0x71;
  cache: Cache;
};

type BlzCacheClearBooleanAction = {
  id: 0x72;
  cache: Cache;
};

type BlzCacheClearUnitAction = {
  id: 0x73;
  cache: Cache;
};

type ArrowKeyAction = {
  id: 0x75;
  arrowKey: number;
};

type BlzSyncAction = {
  id: 0x78;
  identifier: string;
  value: string;
};

type CommandFrameAction = {
  id: 0x79;
  eventId: number;
  val: number;
  text: string;
};

type MouseAction = {
  id: 0x76;
  eventId: number;
  pos: Vec2;
  button: number;
};

type W3APIAction = {
  id: 0x77;
  commandId: number;
  data: number;
  buffer: string;
};

type SetGameSpeedAction = {
  id: 0x3;
  gameSpeed: number;
};

type TrackableHitAction = {
  id: 0x64;
  object: NetTag;
};

type TrackableTrackAction = {
  id: 0x65;
  object: NetTag;
};

type AllyPingAction = {
  id: 0x68;
  pos: Vec2;
  duration: number;
};

export type Action =
  | UnitBuildingAbilityActionNoParams
  | UnitBuildingAbilityActionTargetPositionTargetObjectId
  | GiveItemToUnitAciton
  | UnitBuildingAbilityActionTwoTargetPositions
  | PreSubselectionAction
  | ChangeSelectionAction
  | AssignGroupHotkeyAction
  | SelectGroupHotkeyAction
  | SelectSubgroupAction
  | SelectGroundItemAction
  | CancelHeroRevival
  | RemoveUnitFromBuildingQueue
  | BlzCacheStoreIntAction
  | BlzCacheStoreRealAction
  | BlzCacheStoreBooleanAction
  | BlzCacheStoreUnitAction
  | BlzCacheClearIntAction
  | BlzCacheClearRealAction
  | BlzCacheClearBooleanAction
  | BlzCacheClearUnitAction
  | ESCPressedAction
  | ChooseHeroSkillSubmenu
  | EnterBuildingSubmenu
  | TransferResourcesAction
  | UnitBuildingAbilityActionTargetPosition
  | BlzSyncAction
  | CommandFrameAction
  | MouseAction
  | W3APIAction
  | SetGameSpeedAction
  | UnitBuildingAbilityActionTargetPositionTargetObjectIdItemObjectId
  | SelectUnitAction
  | TrackableHitAction
  | TrackableTrackAction
  | AllyPingAction
  | ArrowKeyAction;

export default class ActionParser extends StatefulBufferParser {
  parse(input: Buffer, post_202: boolean = false): Action[] {
    this.initialize(input);
    const actions: Action[] = [];
    while (this.getOffset() < input.length) {
      try {
        const actionId = this.readUInt8();
        const action = this.parseAction(actionId, post_202);
        if (action !== null) actions.push(action);
      } catch (ex) {
        console.log(ex);
        break;
      }
    }
    return actions;
  }

  private writeHexString(data: string) {
    for (let i = 0; i < data.length; ) {
      process.stdout.write(data[i] + data[i + 1]);
      i += 2;
      process.stdout.write(" ");
      if (i % 32 == 0 && i < data.length) {
        process.stdout.write("\n");
      }
    }
    console.log();
  }

  private oldActionId: number = 999999;
  private parseAction(
    actionId: number,
    post_202: boolean = false,
  ): Action | null {
    try {
      if (post_202 && actionId > 0x77) {
        actionId++;
      }
      switch (actionId) {
        // no action 0x00
        case 0x1:
          this.skip(1);
          break;
        case 0x2:
          break;
        case 0x3:
          const gameSpeed = this.readUInt8();
          return { id: actionId, gameSpeed };
        case 0x4:
        case 0x5:
          break;
        case 0x6:
          this.readZeroTermString("utf-8");
          this.readZeroTermString("utf-8");
          this.readUInt8();
          break;
        case 0x7:
          this.skip(4);
          break;
        // no actions 0x08 - 0x0f
        case 0x10: {
          const abilityFlags = this.readUInt16LE();
          const orderId = this.readFourCC();
          this.skip(8); // AgentTag
          return { id: actionId, abilityFlags, orderId };
        }
        case 0x11: {
          const abilityFlags = this.readUInt16LE();
          const orderId = this.readFourCC();
          this.skip(8); // AgentTag
          const target = this.readVec2();
          return { id: actionId, abilityFlags, orderId, target };
        }
        case 0x12: {
          const abilityFlags = this.readUInt16LE();
          const orderId = this.readFourCC();
          this.skip(8); // AgentTag
          const target = this.readVec2();
          const object = this.readNetTag();
          return {
            id: actionId,
            abilityFlags,
            orderId,
            target,
            object,
          };
        }
        case 0x13: {
          const abilityFlags = this.readUInt16LE();
          const orderId = this.readFourCC();
          this.skip(8); // AgentTag
          const target = this.readVec2();
          const unit = this.readNetTag();
          const item = this.readNetTag();
          return {
            id: actionId,
            abilityFlags,
            orderId,
            target,
            unit,
            item,
          };
        }
        case 0x14: {
          const abilityFlags = this.readUInt16LE();
          const orderId1 = this.readFourCC();
          this.skip(8); // AgentTag
          const targetA = this.readVec2();
          const orderId2 = this.readFourCC();
          const flags = this.readUInt32LE();
          const category = this.readUInt32LE();
          const owner = this.readUInt8();
          const targetB = this.readVec2();
          return {
            id: actionId,
            abilityFlags,
            orderId1,
            targetA,
            orderId2,
            flags,
            category,
            owner,
            targetB,
          };
        }
        case 0x15: {
          const abilityFlags = this.readUInt16LE();
          const orderId1 = this.readFourCC();
          this.skip(8); // AgentTag
          const targetA = this.readVec2();
          const orderId2 = this.readFourCC();
          const flags = this.readUInt32LE();
          const category = this.readUInt32LE();
          const owner = this.readUInt8();
          const targetB = this.readVec2();
          const object = this.readNetTag();
          return {
            id: actionId,
            abilityFlags,
            orderId1,
            targetA,
            orderId2,
            flags,
            category,
            owner,
            targetB,
            object,
          };
        }
        case 0x16: {
          const selectMode = this.readUInt8();
          const numberUnits = this.readUInt16LE();
          const actions = this.readSelectionUnits(numberUnits);
          return { id: actionId, selectMode, numberUnits, units: actions };
        }
        case 0x17: {
          const groupNumber = this.readUInt8();
          const numberUnits = this.readUInt16LE();
          const actions = this.readSelectionUnits(numberUnits);
          return { id: actionId, groupNumber, numberUnits, units: actions };
        }
        case 0x18: {
          const groupNumber = this.readUInt8();
          this.skip(1);
          return { id: actionId, groupNumber };
        }
        case 0x19: {
          const itemId = this.readFourCC();
          const object = this.readNetTag();
          return { id: actionId, itemId, object };
        }
        case 0x1a: {
          return { id: actionId };
        }
        case 0x1b: {
          this.skip(1);
          const object = this.readNetTag();
          return { id: actionId, object };
        }
        case 0x1c: {
          this.skip(1);
          const item = this.readNetTag();
          return { id: actionId, item };
        }
        case 0x1d: {
          const hero = this.readNetTag();
          return { id: actionId, hero };
        }
        case 0x1e:
        // couldn't find action 0x1f in reference
        case 0x1f: {
          const slotNumber = this.readUInt8();
          const itemId = this.readFourCC();
          return { id: actionId, slotNumber, itemId };
        }
        // 0x20 to 0x4f are cheat actions
        // case 0x20:
        //   break;
        // case 0x21:
        //   this.skip(8);
        //   break;
        // case 0x22:
        // case 0x23:
        // case 0x24:
        // case 0x25:
        // case 0x26:
        //   break;
        // case 0x27:
        // case 0x28:
        //   this.skip(5);
        //   break;
        // case 0x29:
        // case 0x2a:
        // case 0x2b:
        // case 0x2c:
        //   break;
        // case 0x2d:
        //   this.skip(5);
        //   break;
        // case 0x2e:
        //   this.skip(4);
        //   break;
        // case 0x2f:
        //   break;
        // TODO: the rest of the cheats

        // END OF TODO
        case 0x50:
          this.readUInt8(); // slotNumber
          this.readUInt32LE(); // flags
          return null;
        case 0x51:
          const slot = this.readUInt8();
          const gold = this.readUInt32LE();
          const lumber = this.readUInt32LE();
          return { id: actionId, slot, gold, lumber };
        // no actions 0x52 - 0x5f
        case 0x60:
          this.skip(8);
          this.readZeroTermString("utf-8");
          return null;
        case 0x61:
          return { id: actionId };
        case 0x62:
          this.skip(12);
          return null;
        case 0x63:
          this.skip(8);
          return null;
        case 0x64:
        case 0x65: {
          const object = this.readNetTag();
          return { id: actionId, object };
        }
        case 0x66:
        case 0x67:
          return {
            id: actionId,
          };
        case 0x68: {
          const pos = this.readVec2();
          const duration = this.readFloatLE();
          return { id: actionId, pos, duration };
        }
        case 0x69:
        case 0x6a: {
          this.skip(16);
          break;
        }
        case 0x6b: {
          const cache = this.readCacheDesc();
          const value = this.readUInt32LE();
          return { id: actionId, cache, value };
        }
        case 0x6c: {
          const cache = this.readCacheDesc();
          const value = this.readFloatLE();
          return { id: actionId, cache, value };
        }
        case 0x6d: {
          const cache = this.readCacheDesc();
          const value = this.readUInt8();
          return { id: actionId, cache, value };
        }
        case 0x6e: {
          const cache = this.readCacheDesc();
          const value = this.readCacheUnit();
          return { id: actionId, cache, value };
        }
        // no action 0x6f
        case 0x70: {
          const cache = this.readCacheDesc();
          return { id: actionId, cache };
        }
        case 0x71: {
          const cache = this.readCacheDesc();
          return { id: actionId, cache };
        }
        case 0x72: {
          const cache = this.readCacheDesc();
          return { id: actionId, cache };
        }
        case 0x73: {
          const cache = this.readCacheDesc();
          return { id: actionId, cache };
        }
        // no action 0x74
        case 0x75: {
          const arrowKey = this.readUInt8();
          return { id: actionId, arrowKey };
          break;
        }
        case 0x76: {
          const eventId = this.readUInt8();
          const pos = this.readVec2();
          const button = this.readUInt8();
          return { id: actionId, eventId, pos, button };
        }
        case 0x77: {
          const commandId = this.readUInt32LE();
          const data = this.readUInt32LE();
          const buffLen = this.readUInt32LE();
          const buffer = this.readStringOfLength(buffLen, "utf-8");
          return { id: actionId, commandId, data, buffer };
        }
        case 0x78: {
          const identifier = this.readZeroTermString("utf8");
          const value = this.readZeroTermString("utf8");
          this.skip(4);
          return { id: actionId, identifier, value };
        }
        case 0x79: {
          this.skip(8);
          const eventId = this.readUInt32LE();
          const val = this.readFloatLE();
          const text = this.readZeroTermString("utf-8");
          return { id: actionId, eventId, val, text };
        }
        case 0x7a:
          this.skip(20);
          break;
        case 0x7b:
          this.skip(16);
          break;
        // no actions 0x7c - 0x80
        // 0x81 - 0x85 are replay actions
        // no actions 0x86 - 0x9f
        // 0xa0 and 0xa1 are cheats
        case 0xa0:
          this.skip(14);
          break;
        case 0xa1:
          this.skip(9);
        default:
          console.log(
            "unknown action id ",
            actionId,
            " after ",
            this.oldActionId,
            " at offset ",
            this.getOffset() - 1,
          );
          return null;
      }
      return null;
    } finally {
      this.oldActionId = actionId;
    }
  }

  private readSelectionUnits(length: number): NetTag[] {
    const v: NetTag[] = [];
    for (let i = 0; i < length; i++) {
      v.push(this.readNetTag());
    }
    return v;
  }

  private readFourCC(): number[] {
    const fourCC = [
      this.readUInt8(),
      this.readUInt8(),
      this.readUInt8(),
      this.readUInt8(),
    ];
    return fourCC;
  }

  private readCacheDesc(): Cache {
    const filename = this.readZeroTermString("utf-8");
    const missionKey = this.readZeroTermString("utf-8");
    const key = this.readZeroTermString("utf-8");
    return { filename, missionKey, key };
  }

  private readCacheItem(): Item {
    const itemId = this.readFourCC();
    const charges = this.readUInt32LE();
    const flags = this.readUInt32LE();
    return { itemId, charges, flags };
  }

  private readAbility(): Ability {
    const id = this.readFourCC();
    const level = this.readUInt32LE();
    return { id, level };
  }

  private readCacheHeroData(): HeroData {
    const xp = this.readUInt32LE();
    const level = this.readUInt32LE();
    const skillPoints = this.readUInt32LE();
    const properNameId = this.readUInt32LE();
    const str = this.readUInt32LE();
    const strBonus = this.readFloatLE();
    const agi = this.readUInt32LE();
    const speedMod = this.readFloatLE();
    const cooldownMod = this.readFloatLE();
    const agiBonus = this.readFloatLE();
    const intel = this.readUInt32LE();
    const intBonus = this.readFloatLE();
    const heroAbilCount = this.readUInt32LE();
    const heroAbils: Ability[] = [];
    for (let i = 0; i < heroAbilCount; i++) {
      heroAbils.push(this.readAbility());
    }
    const maxLife = this.readFloatLE();
    const maxMana = this.readFloatLE();
    const sight = this.readFloatLE();
    const damageCount = this.readUInt32LE();
    const damage: number[] = [];
    for (let i = 0; i < damageCount; i++) {
      damage.push(this.readUInt32LE());
    }
    const defense = this.readFloatLE();
    const controlGroups = this.readUInt16LE();
    return {
      xp,
      level,
      skillPoints,
      properNameId,
      str,
      strBonus,
      agi,
      speedMod,
      cooldownMod,
      agiBonus,
      intel,
      intBonus,
      heroAbils,
      maxLife,
      maxMana,
      sight,
      damage,
      defense,
      controlGroups,
    };
  }

  private readCacheUnit(): Unit {
    const unitId = this.readFourCC();
    const itemsCount = this.readUInt32LE();
    const items: Item[] = [];
    for (let i = 0; i < itemsCount; i++) {
      items.push(this.readCacheItem());
    }
    const heroData = this.readCacheHeroData();
    return { unitId, items, heroData };
  }

  private readNetTag(): NetTag {
    const tag1 = this.readUInt32LE();
    const tag2 = this.readUInt32LE();
    return [tag1, tag2];
  }

  private readVec2(): Vec2 {
    const x = this.readFloatLE();
    const y = this.readFloatLE();
    return [x, y];
  }
}
