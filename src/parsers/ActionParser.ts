/* eslint-disable @typescript-eslint/no-unused-vars */
import StatefulBufferParser from "./StatefulBufferParser";

type UnitBuildingAbilityActionNoParams = {
  id: 0x10;
  abilityFlags: number;
  itemId: number[];
};

type UnitBuildingAbilityActionTargetPosition = {
  id: 0x11;
  abilityFlags: number;
  itemId: number[];
  targetX: number;
  targetY: number;
};

type UnitBuildingAbilityActionTargetPositionTargetObjectId = {
  id: 0x12;
  abilityFlags: number;
  itemId: number[];
  targetX: number;
  targetY: number;
  objectId1: number;
  objectId2: number;
};

export type TransferResourcesAction = {
  id: 0x51;
  slot: number;
  gold: number;
  lumber: number;
};

type GiveItemToUnitAciton = {
  id: 0x13;
  abilityFlags: number;
  itemId: number[];
  targetX: number;
  targetY: number;
  objectId1: number;
  objectId2: number;
  itemObjectId1: number;
  itemObjectId2: number;
};

type UnitBuildingAbilityActionTwoTargetPositions = {
  id: 0x14;
  abilityFlags: number;
  itemId1: number[];
  targetAX: number;
  targetAY: number;
  itemId2: number[];
  targetBX: number;
  targetBY: number;
};

type ChangeSelectionAction = {
  id: 0x16;
  selectMode: number;
  numberUnits: number;
  actions: { itemId1: number[]; itemId2: number[] }[];
};

type AssignGroupHotkeyAction = {
  id: 0x17;
  groupNumber: number;
  numberUnits: number;
  actions: { itemId1: number[]; itemId2: number[] }[];
};

type SelectGroupHotkeyAction = {
  id: 0x18;
  groupNumber: number;
};

type SelectGroundItemAction = {
  id: 0x1c;
  itemId1: number[];
  itemId2: number[];
};

type SelectSubgroupAction = {
  id: 0x19;
  itemId: number[];
  objectId1: number;
  objectId2: number;
};

type CancelHeroRevival = {
  id: 0x1d;
  itemId1: number[];
  itemId2: number[];
};

type ChooseHeroSkillSubmenu = {
  id: 0x65 | 0x66;
};

type EnterBuildingSubmenu = {
  id: 0x67;
};

type ESCPressedAction = {
  id: 0x61;
};

type RemoveUnitFromBuildingQueue = {
  id: 0x1e | 0x1f;
  slotNumber: number;
  itemId: number[];
};

type PreSubselectionAction = {
  id: 0x1a;
};

export type W3MMDAction = {
  id: 0x6b;
  filename: string;
  missionKey: string;
  key: string;
  value: number;
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
  | W3MMDAction
  | ESCPressedAction
  | ChooseHeroSkillSubmenu
  | EnterBuildingSubmenu
  | TransferResourcesAction
  | UnitBuildingAbilityActionTargetPosition;

export default class ActionParser extends StatefulBufferParser {
  parse(input: Buffer): Action[] {
    this.initialize(input);
    const actions: Action[] = [];
    while (this.getOffset() < input.length) {
      try {
        const actionId = this.readUInt8();
        const action = this.parseAction(actionId);
        if (action !== null) actions.push(action);
      } catch (ex) {
        console.log(ex);
        break;
      }
    }
    return actions;
  }

  private parseAction(actionId: number): Action | null {
    switch (actionId) {
      case 0x79:
        this.skip(0x11);
        break;
      case 0x78:
        this.skip(0xf);
        this.readZeroTermString("ascii");
        this.skip(4);
        break;
      case 0x76:
        this.skip(0xa);
        break;
      case 0x73:
        this.skip(0x6);
        break;
      case 0x1:
        break;
      case 0x2:
        break;
      case 0x3:
        this.skip(1);
        break;
      case 0x4:
      case 0x5:
        break;
      case 0x6:
        this.readZeroTermString("utf-8");
        break;
      case 0x7:
        this.skip(2);
        break;
      case 0x10: {
        const abilityFlags = this.readUInt16LE();
        const itemId = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const unknownA = this.readUInt32LE();
        const unknownB = this.readUInt32LE();
        return { id: actionId, abilityFlags, itemId };
      }
      case 0x11: {
        const abilityFlags = this.readUInt16LE();
        const itemId = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const unknownA = this.readUInt32LE();
        const unknownB = this.readUInt32LE();
        const targetX = this.readFloatLE();
        const targetY = this.readFloatLE();
        return { id: actionId, abilityFlags, itemId, targetX, targetY };
      }

      case 0x12: {
        const abilityFlags = this.readUInt16LE();
        const itemId = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const unknownA = this.readUInt32LE();
        const unknownB = this.readUInt32LE();
        const targetX = this.readFloatLE();
        const targetY = this.readFloatLE();
        const objectId1 = this.readUInt32LE();
        const objectId2 = this.readUInt32LE();
        return {
          id: actionId,
          abilityFlags,
          itemId,
          targetX,
          targetY,
          objectId1,
          objectId2,
        };
      }

      case 0x13: {
        const abilityFlags = this.readUInt16LE();
        const itemId = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const unknownA = this.readUInt32LE();
        const unknownB = this.readUInt32LE();
        const targetX = this.readFloatLE();
        const targetY = this.readFloatLE();
        const objectId1 = this.readUInt32LE();
        const objectId2 = this.readUInt32LE();
        const itemObjectId1 = this.readUInt32LE();
        const itemObjectId2 = this.readUInt32LE();
        return {
          id: actionId,
          abilityFlags,
          itemId,
          targetX,
          targetY,
          objectId1,
          objectId2,
          itemObjectId1,
          itemObjectId2,
        };
      }
      case 0x14: {
        const abilityFlags = this.readUInt16LE();
        const itemId1 = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const unknownA = this.readUInt32LE();
        const unknownB = this.readUInt32LE();
        const targetAX = this.readFloatLE();
        const targetAY = this.readFloatLE();
        const itemId2 = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        this.skip(9);
        const targetBX = this.readFloatLE();
        const targetBY = this.readFloatLE();
        return {
          id: actionId,
          abilityFlags,
          itemId1,
          targetAX,
          targetAY,
          itemId2,
          targetBX,
          targetBY,
        };
      }
      case 0x16: {
        const selectMode = this.readUInt8();
        const numberUnits = this.readUInt16LE();
        const actions = this.readSelectionUnits(numberUnits);
        return { id: actionId, selectMode, numberUnits, actions };
      }
      case 0x17: {
        const groupNumber = this.readUInt8();
        const numberUnits = this.readUInt16LE();
        const actions = this.readSelectionUnits(numberUnits);
        return { id: actionId, groupNumber, numberUnits, actions };
      }
      case 0x18: {
        const groupNumber = this.readUInt8();
        this.skip(1);
        return { id: actionId, groupNumber };
      }
      case 0x19: {
        const itemId = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const objectId1 = this.readUInt32LE();
        const objectId2 = this.readUInt32LE();
        return { id: actionId, itemId, objectId1, objectId2 };
      }
      case 0x1a: {
        return { id: actionId };
      }

      case 0x1b: {
        this.skip(9);
        return null;
      }
      case 0x1c: {
        this.skip(1);
        const itemId1 = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const itemId2 = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        return { id: actionId, itemId1, itemId2 };
      }
      case 0x1d: {
        const itemId1 = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        const itemId2 = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        return { id: actionId, itemId1, itemId2 };
      }
      case 0x1e:
      case 0x1f: {
        const slotNumber = this.readUInt8();
        const itemId = [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ];
        return { id: actionId, slotNumber, itemId };
      }
      case 0x27:
      case 0x28:
      case 0x2d:
        this.skip(5);
        break;
      case 0x2e:
        this.skip(4);
        break;
      case 0x50:
        const slotNumber = this.readUInt8();
        const flags = this.readUInt32LE();
        return null;
      case 0x51:
        const slot = this.readUInt8();
        const gold = this.readUInt32LE();
        const lumber = this.readUInt32LE();
        return {
          id: 0x51,
          slot: slot,
          gold: gold,
          lumber,
        };
      case 0x60:
        this.skip(8);
        this.readZeroTermString("utf-8");
        return null;
      case 0x61:
        return { id: 0x61 };
      case 0x62:
        this.skip(12);
        return null;
      case 0x65:
      case 0x66:
      case 0x67:
        return {
          id: actionId,
        };
      case 0x68: {
        this.skip(12);
        return null;
      }
      case 0x69:
      case 0x6a: {
        this.skip(16);
        return null;
      }
      case 0x6b: {
        const filename = this.readZeroTermString("utf-8");
        const missionKey = this.readZeroTermString("utf-8");
        const key = this.readZeroTermString("utf-8");
        const value = this.readUInt32LE();
        return { id: actionId, filename, missionKey, key, value };
      }
      case 0x75: {
        this.skip(1);
        return null;
      }
      case 0x77:
        this.skip(13);
        return null;
      case 0x7a:
        this.skip(20);
        return null;
      case 0x7b:
        this.skip(16);
        return null;
      default:
        console.log("unknown action id ", actionId);
        return null;
    }
    return null;
  }

  private readSelectionUnits(
    length: number,
  ): { itemId1: number[]; itemId2: number[] }[] {
    const v: { itemId1: number[]; itemId2: number[] }[] = [];
    for (let i = 0; i < length; i++) {
      const obj = {
        itemId1: [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ],
        itemId2: [
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
          this.readUInt8(),
        ],
      };
      v.push(obj);
    }
    return v;
  }
}
