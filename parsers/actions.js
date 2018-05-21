/*
  Parses a CommandDataBlock that is contained inside of a TimeSlotBlock
*/

const { Parser } = require('binary-parser')
const { objectIdFormatter } = require('./formatters')

const PauseGameAction = new Parser()
const ResumeGameAction = new Parser()

const SetGameSpeedAction = new Parser()
  .int8('speed')

const IncreaseGameSpeedAction = new Parser()
const DecreaseGameSpeedAction = new Parser()

const SaveGameAction = new Parser()
  .string('saveGameName', {zeroTerminated: true})

const SaveGameFinishedAction = new Parser()
  .int16le()

const UnitBuildingAbilityActionNoParams = new Parser()
  .int16le('abilityFlags')
  .array('itemId', {
    type: 'uint8',
    length: 4,
    formatter: objectIdFormatter
  })
  .int32le('unknownA')
  .int32le('unknownB')

const UnitBuildingAbilityActionTargetPosition = new Parser()
  .int16le('abilityFlags')
  .array('itemId', {
    type: 'uint8',
    length: 4,
    formatter: objectIdFormatter
  })
  .int32le('unknownA')
  .int32le('unknownB')
  .int32le('targetX')
  .int32le('targetY')

const UnitBuildingAbilityActionTargetPositionTargetObjectId = new Parser()
  .int16le('abilityFlags')
  .array('itemId', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .int32le('unknownA')
  .int32le('unknownB')
  .int32le('targetX')
  .int32le('targetY')
  .int32le('objectId1')
  .int32le('objectId2')

const GiveItemToUnitAction = new Parser()
  .int16le('abilityFlags')
  .array('itemId', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .int32le('unknownA')
  .int32le('unknownB')
  .int32le('targetX')
  .int32le('targetY')
  .int32le('objectId1')
  .int32le('objectId2')
  .int32le('itemObjectId1')
  .int32le('itemObjectId2')

const UnitBuildingAbilityActionTwoTargetPositions = new Parser()
  .int16le('abilityFlags')
  .array('itemId1', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .int32le('unknownA')
  .int32le('unknownB')
  .int32le('targetAX')
  .int32le('targetAY')
  .array('itemId2', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .skip(9)
  .int32le('targetBX')
  .int32le('targetBY')

const SelectionUnit = new Parser()
  .array('itemId1', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .array('itemId2', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })

const ChangeSelectionAction = new Parser()
  .int8('selectMode')
  .int16le('numberUnits')
  .array('actions', {
    type: SelectionUnit,
    length: 'numberUnits'
  })

const AssignGroupHotkeyAction = new Parser()
  .int8('groupNumber')
  .int16le('numberUnits')
  .array('actions', {
    type: SelectionUnit,
    length: 'numberUnits'
  })

const SelectGroupHotkeyAction = new Parser()
  .int8('groupNumber')
  .int8('unknown')

const SelectSubgroupAction = new Parser()
  .array('itemId', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .int32le('objectId1')
  .int32le('objectId2')

const PreSubselectionAction = new Parser()

const UnknownAction1B = new Parser()
  .skip(9)

const SelectGroundItemAction = new Parser()
  .skip(1)
  .array('itemId1', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .array('itemId2', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })

const CancelHeroRevivalAction = new Parser()
  .array('itemId1', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })
  .array('itemId2', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })

const RemoveUnitFromBuildingQueueAction = new Parser()
  .int8('slotNumber')
  .array('itemId', {
    type: 'int8',
    length: 4,
    formatter: objectIdFormatter
  })

const ChangeAllyOptionsAction = new Parser()
  .int8('slotNumber')
  .int32le('flags')

const TransferResourcesAction = new Parser()
  .skip(9)

const MapTriggerChatAction = new Parser()
  .skip(8)
  .string('action', {zeroTerminated: true})

const ESCPressedAction = new Parser()

const ChooseHeroSkillSubmenu = new Parser()

const EnterBuildingSubmenu = new Parser()

const MinimapSignal = new Parser()
  .skip(12)

const ContinueGame = new Parser()
  .skip(16)

const UnknownAction75 = new Parser()
  .skip(1)

const ScenarioTriggerAction = new Parser()
  .skip(12)

const W3MMDAction = new Parser()
  .string('filename', {zeroTerminated: true})
  .string('missionKey', {zeroTerminated: true})
  .string('key', {zeroTerminated: true})
  .int32le('value')

const ActionBlock = new Parser()
  .int8('actionId')
  .choice({
    tag: 'actionId',
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
      0x1A: PreSubselectionAction,
      0x1B: UnknownAction1B,
      0x1C: SelectGroundItemAction,
      0x1D: CancelHeroRevivalAction,
      0x1E: RemoveUnitFromBuildingQueueAction,
      0x1F: RemoveUnitFromBuildingQueueAction,
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
      0x75: UnknownAction75
    }
  })

const ActionBlockList = new Parser()
  .array(null, { type: ActionBlock, readUntil: 'eof' })

// 0x17
const CommandDataBlock = new Parser()
  .int8('playerId')
  .int16le('actionBlockLength')
  .buffer('actions', {length: 'actionBlockLength'})

module.exports = {
  CommandDataBlock,
  ActionBlockList
}
