/*
  Parses a CommandDataBlock that is contained inside of a TimeSlotBlock
*/

import { Parser } from "binary-parser";

const PauseGameAction = new Parser();
const ResumeGameAction = new Parser();

const SetGameSpeedAction = new Parser().int8("speed");

const IncreaseGameSpeedAction = new Parser();
const DecreaseGameSpeedAction = new Parser();

const SaveGameAction = new Parser().string("saveGameName", {
  zeroTerminated: true,
});

const SaveGameFinishedAction = new Parser().int16le("");

const UnitBuildingAbilityActionNoParams = new Parser()
  .int16le("abilityFlags")
  .array("itemId", {
    type: "uint8",
    length: 4,
  })
  .int32le("unknownA")
  .int32le("unknownB");

const UnitBuildingAbilityActionTargetPosition = new Parser()
  .int16le("abilityFlags")
  .array("itemId", {
    type: "uint8",
    length: 4,
  })
  .int32le("unknownA")
  .int32le("unknownB")
  .floatle("targetX")
  .floatle("targetY");

const UnitBuildingAbilityActionTargetPositionTargetObjectId = new Parser()
  .int16le("abilityFlags")
  .array("itemId", {
    type: "uint8",
    length: 4,
  })
  .int32le("unknownA")
  .int32le("unknownB")
  .floatle("targetX")
  .floatle("targetY")
  .int32le("objectId1")
  .int32le("objectId2");

const GiveItemToUnitAction = new Parser()
  .int16le("abilityFlags")
  .array("itemId", {
    type: "uint8",
    length: 4,
  })
  .int32le("unknownA")
  .int32le("unknownB")
  .floatle("targetX")
  .floatle("targetY")
  .int32le("objectId1")
  .int32le("objectId2")
  .int32le("itemObjectId1")
  .int32le("itemObjectId2");

const UnitBuildingAbilityActionTwoTargetPositions = new Parser()
  .int16le("abilityFlags")
  .array("itemId1", {
    type: "uint8",
    length: 4,
  })
  .int32le("unknownA")
  .int32le("unknownB")
  .floatle("targetAX")
  .floatle("targetAY")
  .array("itemId2", {
    type: "uint8",
    length: 4,
  })
  .skip(9)
  .floatle("targetBX")
  .floatle("targetBY");

const SelectionUnit = new Parser()
  .array("itemId1", {
    type: "uint8",
    length: 4,
  })
  .array("itemId2", {
    type: "uint8",
    length: 4,
  });

const ChangeSelectionAction = new Parser()
  .int8("selectMode")
  .int16le("numberUnits")
  .array("actions", {
    type: SelectionUnit,
    length: "numberUnits",
  });

const AssignGroupHotkeyAction = new Parser()
  .int8("groupNumber")
  .int16le("numberUnits")
  .array("actions", {
    type: SelectionUnit,
    length: "numberUnits",
  });

const SelectGroupHotkeyAction = new Parser()
  .int8("groupNumber")
  .int8("unknown");

const SelectSubgroupAction = new Parser()
  .array("itemId", {
    type: "uint8",
    length: 4,
  })
  .int32le("objectId1")
  .int32le("objectId2");

const PreSubselectionAction = new Parser();

const UnknownAction1B = new Parser().skip(9);

const SelectGroundItemAction = new Parser()
  .skip(1)
  .array("itemId1", {
    type: "uint8",
    length: 4,
  })
  .array("itemId2", {
    type: "uint8",
    length: 4,
  });

const CancelHeroRevivalAction = new Parser()
  .array("itemId1", {
    type: "uint8",
    length: 4,
  })
  .array("itemId2", {
    type: "uint8",
    length: 4,
  });

const RemoveUnitFromBuildingQueueAction = new Parser()
  .int8("slotNumber")
  .array("itemId", {
    type: "uint8",
    length: 4,
  });

const ChangeAllyOptionsAction = new Parser()
  .int8("slotNumber")
  .int32le("flags");

const TransferResourcesAction = new Parser().skip(9);

const MapTriggerChatAction = new Parser()
  .skip(8)
  .string("action", { zeroTerminated: true });

const ESCPressedAction = new Parser();

const ChooseHeroSkillSubmenu = new Parser();

const EnterBuildingSubmenu = new Parser();

const MinimapSignal = new Parser().skip(12);

const ContinueGame = new Parser().skip(16);

const UnknownAction75 = new Parser().skip(1);

const ScenarioTriggerAction = new Parser().skip(12);

const W3MMDAction = new Parser()
  .string("filename", { zeroTerminated: true })
  .string("missionKey", { zeroTerminated: true })
  .string("key", { zeroTerminated: true })
  .int32le("value");

const ActionBlock = new Parser().int8("id").choice("", {
  tag: "id",
  choices: {
    0x1: PauseGameAction,
    0x2: ResumeGameAction,
    0x3: SetGameSpeedAction,
    0x4: IncreaseGameSpeedAction,
    0x5: DecreaseGameSpeedAction,
    0x6: SaveGameAction,
    0x7: SaveGameFinishedAction,
    0x10: UnitBuildingAbilityActionNoParams,
    0x11: UnitBuildingAbilityActionTargetPosition,
    0x12: UnitBuildingAbilityActionTargetPositionTargetObjectId,
    0x13: GiveItemToUnitAction,
    0x14: UnitBuildingAbilityActionTwoTargetPositions,
    0x16: ChangeSelectionAction,
    0x17: AssignGroupHotkeyAction,
    0x18: SelectGroupHotkeyAction,
    0x19: SelectSubgroupAction,
    0x1a: PreSubselectionAction,
    0x1b: UnknownAction1B,
    0x1c: SelectGroundItemAction,
    0x1d: CancelHeroRevivalAction,
    0x1e: RemoveUnitFromBuildingQueueAction,
    0x1f: RemoveUnitFromBuildingQueueAction,
    0x20: new Parser(),
    0x22: new Parser(),
    0x23: new Parser(),
    0x24: new Parser(),
    0x25: new Parser(),
    0x26: new Parser(),
    0x27: new Parser().skip(5),
    0x28: new Parser().skip(5),
    0x29: new Parser(),
    0x2a: new Parser(),
    0x2b: new Parser(),
    0x2c: new Parser(),
    0x2d: new Parser().skip(5),
    0x2e: new Parser().skip(4),
    0x2f: new Parser(),
    0x30: new Parser(),
    0x31: new Parser(),
    0x32: new Parser(),
    0x50: ChangeAllyOptionsAction,
    0x51: TransferResourcesAction,
    0x60: MapTriggerChatAction,
    0x61: ESCPressedAction,
    0x62: ScenarioTriggerAction,
    0x63: new Parser(),
    0x66: ChooseHeroSkillSubmenu,
    0x65: ChooseHeroSkillSubmenu,
    0x67: EnterBuildingSubmenu,
    0x68: MinimapSignal,
    0x69: ContinueGame,
    0x6a: ContinueGame,
    0x6b: W3MMDAction,
    0x6c: new Parser(),
    0x6d: new Parser(),
    0x75: UnknownAction75,
    0x77: new Parser().skip(13),
    0x7a: new Parser().skip(20),
    0x7b: new Parser().buffer("data", { length: 16 }),
  },
});

const ActionBlockList = new Parser().array("", {
  type: ActionBlock,
  readUntil: "eof",
});

const CommandDataBlock = new Parser()
  .int8("playerId")
  .int16le("actionBlockLength")
  .buffer("actions", { length: "actionBlockLength" });

export type CommandDataBlockType = ReturnType<typeof CommandDataBlock.parse>;

export { CommandDataBlock, ActionBlockList };

export type W3MMDActionType = ReturnType<typeof W3MMDAction.parse> & {
  id: 0x6b;
};

export type UnitBuildingAbilityActionNoParamsType = ReturnType<
  typeof UnitBuildingAbilityActionNoParams.parse
> & { id: 0x10 };

export type UnitBuildingAbilityActionTargetPositionType = ReturnType<
  typeof UnitBuildingAbilityActionTargetPosition.parse
> & { id: 0x11 };

export type UnitBuildingAbilityActionTwoTargetPositionsType = ReturnType<
  typeof UnitBuildingAbilityActionTwoTargetPositions.parse
> & { id: 0x14 };

export type UnitBuildingAbilityActionTargetPositionTargetObjectIdType = ReturnType<
  typeof UnitBuildingAbilityActionTargetPositionTargetObjectId.parse
> & { id: 0x12 };

export type GiveItemToUnitActionType = ReturnType<
  typeof UnitBuildingAbilityActionTargetPositionTargetObjectId.parse
> & { id: 0x13 };

export type ChangeSelectionActionType = ReturnType<
  typeof ChangeSelectionAction.parse
> & { id: 0x16 };

export type AssignGroupHotkeyActionType = ReturnType<
  typeof AssignGroupHotkeyAction.parse
> & { id: 0x17 };

export type SelectGroupHotkeyActionType = ReturnType<
  typeof SelectGroupHotkeyAction.parse
> & { id: 0x18 };

export type SelectSubgroupActionType = ReturnType<
  typeof SelectSubgroupAction.parse
> & { id: 0x19 };

export type PreSubselectionActionType = ReturnType<
  typeof PreSubselectionAction.parse
> & { id: 0x1a };

export type SelectGroundItemActionType = ReturnType<
  typeof SelectGroundItemAction.parse
> & { id: 0x1c };

export type RemoveUnitFromBuildingQueueActionType = ReturnType<
  typeof RemoveUnitFromBuildingQueueAction.parse
> & { id: 0x1e | 0x1f };

export type CancelHeroRevivalActionType = ReturnType<
  typeof CancelHeroRevivalAction.parse
> & { id: 0x1d };

export type ESCPressedActionType = ReturnType<typeof ESCPressedAction.parse> & {
  id: 0x61;
};

export type ChooseHeroSkillSubmenuType = ReturnType<
  typeof ChooseHeroSkillSubmenu.parse
> & {
  id: 0x66 | 0x65;
};

export type EnterBuildingSubmenuType = ReturnType<
  typeof EnterBuildingSubmenu.parse
> & {
  id: 0x67;
};

export type ActionType =
  | UnitBuildingAbilityActionNoParamsType
  | UnitBuildingAbilityActionTargetPositionTargetObjectIdType
  | UnitBuildingAbilityActionTargetPositionType
  | ChangeSelectionActionType
  | AssignGroupHotkeyActionType
  | SelectGroupHotkeyActionType
  | SelectSubgroupActionType
  | PreSubselectionActionType
  | SelectGroundItemActionType
  | RemoveUnitFromBuildingQueueActionType
  | CancelHeroRevivalActionType
  | ESCPressedActionType
  | ChooseHeroSkillSubmenuType
  | EnterBuildingSubmenuType
  | GiveItemToUnitActionType
  | W3MMDActionType
  | UnitBuildingAbilityActionTwoTargetPositionsType;
