import StatefulBufferParser from "./StatefulBufferParser";

type UnitBuildingAbilityActionNoParams = {
  abilityFlags: number;
  itemId: number[];
};

type UnitBuildingAbilityActionTargetPosition = {
  abilityFlags: number;
  itemId: number[];
  targetX: number;
  targetY: number;
};

type UnitBuildingAbilityActionTargetPositionTargetObjectId = {
  abilityFlags: number;
  itemId: number[];
  targetX: number;
  targetY: number;
  objectId1: number;
  objectId2: number;
};

type GiveItemToUnitAciton = {
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
  abilityFlags: number;
  itemId1: number[];
  targetAX: number;
  targetAY: number;
  itemId2: number[];
  targetBX: number;
  targetBY: number;
};

type ChangeSelectionAction = {
  selectMode: number;
  numberUnits: number;
  actions: { itemId1: number[]; itemId2: number[] }[];
};

type AssignGroupHotkeyAction = {
  groupNumber: number;
  numberUnits: number;
  actions: { itemId1: number[]; itemId2: number[] }[];
};

type SelectGroupHotkeyAction = {
  groupNumber: number;
};

type SelectGroundItemAction = {
  itemId1: number[];
  itemId2: number[];
};

type SelectSubgroupAction = {
  itemId: number[];
  objectId1: number;
  objectId2: number;
};

type CancelHeroRevival = {
  itemId1: number[];
  itemId2: number[];
};

type RemoveUnitFromBuildingQueue = {
  slotNumber: number;
  itemId: number[];
};

type W3MMDAction = {
  filename: string;
  missionKey: string;
  key: string;
  value: number;
};

type Action =
  | UnitBuildingAbilityActionNoParams
  | UnitBuildingAbilityActionTargetPositionTargetObjectId
  | GiveItemToUnitAciton
  | UnitBuildingAbilityActionTwoTargetPositions
  | ChangeSelectionAction
  | AssignGroupHotkeyAction
  | SelectGroupHotkeyAction
  | SelectSubgroupAction
  | SelectGroundItemAction
  | CancelHeroRevival
  | RemoveUnitFromBuildingQueue
  | W3MMDAction
  | UnitBuildingAbilityActionTargetPosition;

export default class ActionParser extends StatefulBufferParser {
  parse(input: Buffer): void {
    this.initialize(input);
    while (this.getOffset() < input.length) {
      try {
        const actionId = this.readUInt8();
        const action = this.parseAction(actionId);
      } catch (ex) {
        console.log(ex);
        break;
      }
    }
  }

  private parseAction(actionId: number): Action | { ignored: true } {
    switch (actionId) {
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
      case 0x7:
        this.skip(2);
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
        return { abilityFlags, itemId };
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
        return { abilityFlags, itemId, targetX, targetY };
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
        return { abilityFlags, itemId, targetX, targetY, objectId1, objectId2 };
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
        30;
        const targetBY = this.readFloatLE();
        34;
        return {
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
        return {
          selectMode,
          numberUnits,
          actions,
        };
      }
      case 0x17: {
        const groupNumber = this.readUInt8();
        const numberUnits = this.readUInt16LE();
        const actions = this.readSelectionUnits(numberUnits);
        return {
          groupNumber,
          numberUnits,
          actions,
        };
      }
      case 0x18: {
        const groupNumber = this.readUInt8();
        this.skip(1);
        return {
          groupNumber,
        };
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
        return {
          itemId,
          objectId1,
          objectId2,
        };
      }
      case 0x1b: {
        this.skip(9);
        return { ignored: true };
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
        return { itemId1, itemId2 };
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
        return {
          itemId1,
          itemId2,
        };
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
        return { slotNumber, itemId };
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
        return {
          ignored: true,
        };
      case 0x51:
        this.skip(9);
        return {
          ignored: true,
        };
      case 0x60:
        this.skip(8);
        this.readZeroTermString("utf-8");
        return {
          ignored: true,
        };

      case 0x61:
        return {
          ignored: true,
        };
      case 0x62:
        this.skip(12);
        return {
          ignored: true,
        };
      case 0x65:
      case 0x66:
        return {
          ignored: true,
        };
      case 0x68: {
        this.skip(12);
        return { ignored: true };
      }
      case 0x69:
      case 0x6a: {
        this.skip(16);
        return {
          ignored: true,
        };
      }
      case 0x6b: {
        const filename = this.readZeroTermString("utf-8");
        const missionKey = this.readZeroTermString("utf-8");
        const key = this.readZeroTermString("utf-8");
        const value = this.readUInt32LE();
        return { filename, missionKey, key, value };
      }
      case 0x75: {
        this.skip(1);
        return { ignored: true };
      }
      case 0x77:
        this.skip(13);
        return { ignored: true };
      case 0x7a:
        this.skip(20);
        return { ignored: true };
      case 0x7b:
        this.skip(16);
        return { ignored: true };
    }
    return { ignored: true };
  }

  private readSelectionUnits(
    length: number
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
