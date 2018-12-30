const convert = require('./convert')
const reverseString = input => input.split('').reverse().join('')
const isObjectId = input => ['u', 'e', 'h', 'o'].indexOf(input[0]) >= 0
const isRightclickAction = input => input[0] === 0x03 && input[1] === 0
const isBasicAction = input => input[0] <= 0x19 && input[1] === 0
const {items, units, buildings, upgrades, abilityToHero} = require('./mappings')

function Player (id, name, teamid, color, race) {
  this.id = id
  this.name = name
  this.teamid = teamid
  this.color = convert.playerColor(color)
  this.race = race
  this.raceDetected = false
  this.units = {summary: {}, order: []}
  this.buildings = {summary: {}, order: []}
  this.upgrades = {summary: {}, order: []}
  this.items = {summary: {}, order: []}
  this.heroSkills = {}
  this.heroes = {}
  this.heroCount = 0
  this.actions = {
    timed: [],
    assigngroup: 0,
    rightclick: 0,
    basic: 0,
    ability: 0,
    item: 0,
    select: 0,
    removeunit: 0,
    subgroup: 0,
    selecthotkey: 0,
    esc: 0
  }
  this._currentlyTrackedAPM = 0
  this.currentTiamePlayed = 0
  return this
}

Player.prototype.newActionTrackingSegment = function (timeTrackingInterval = 60000) {
  this.actions.timed.push(Math.floor(this._currentlyTrackedAPM * (60000.0 / timeTrackingInterval)))
  this._currentlyTrackedAPM = 0
}

Player.prototype.detectRaceByActionId = function (actionId) {
  switch (actionId[0]) {
    case 'e':
      this.raceDetected = 'N'
      break
    case 'o':
      this.raceDetected = 'O'
      break
    case 'h':
      this.raceDetected = 'H'
      break
    case 'u':
      this.raceDetected = 'U'
      break
  }
}

Player.prototype.handleActionId = function (actionId, gametime) {
  if (units[actionId]) {
    this.units.summary[actionId] = this.units.summary[actionId] + 1 || 1
    this.units.order.push({id: actionId, ms: gametime})
  } else if (items[actionId]) {
    this.items.summary[actionId] = this.items.summary[actionId] + 1 || 1
    this.items.order.push({id: actionId, ms: gametime})
  } else if (buildings[actionId]) {
    this.buildings.summary[actionId] = this.buildings.summary[actionId] + 1 || 1
    this.buildings.order.push({id: actionId, ms: gametime})
  } else if (upgrades[actionId]) {
    this.upgrades.summary[actionId] = this.upgrades.summary[actionId] + 1 || 1
    this.upgrades.order.push({id: actionId, ms: gametime})
  }
}

Player.prototype.handleHeroSkill = function (actionId) {
  if (this.heroes[abilityToHero[actionId]] === undefined) {
    this.heroCount += 1
    this.heroes[abilityToHero[actionId]] = {level: 0, abilities: {}, order: this.heroCount, id: abilityToHero[actionId]}
  }
  this.heroes[abilityToHero[actionId]].level += 1
  this.heroes[abilityToHero[actionId]].abilities[actionId] = this.heroes[abilityToHero[actionId]].abilities[actionId] || 0
  this.heroes[abilityToHero[actionId]].abilities[actionId] += 1
}

Player.prototype.handle0x10 = function (actionId, gametime) {
  if (typeof actionId === 'string') {
    actionId = reverseString(actionId)
  }

  switch (actionId[0]) {
    case 'A':
      this.heroSkills[actionId] = this.heroSkills[actionId] + 1 || 1
      this.handleHeroSkill(actionId, gametime)
      break
    case 'R':
      this.handleActionId(actionId, gametime)
      break
    case 'u':
    case 'e':
    case 'h':
    case 'o':
      if (!this.raceDetected) this.detectRaceByActionId(actionId)
      this.handleActionId(actionId, gametime)
      break
    default:
      this.handleActionId(actionId, gametime)
  }

  actionId[0] !== '0'
    ? this.actions['buildtrain'] = this.actions['buildtrain'] + 1 || 1
    : this.actions['ability'] = this.actions['ability'] + 1 || 1

  this._currentlyTrackedAPM++
}

Player.prototype.handle0x11 = function (actionId, gametime) {
  if (Array.isArray(actionId)) {
    if (actionId[0] <= 0x19 && actionId[1] === 0) {
      this.actions['basic'] = this.actions['basic'] + 1 || 1
    } else {
      this.actions['ability'] = this.actions['ability'] + 1 || 1
    }
  }
  if (typeof actionId === 'string') {
    actionId = reverseString(actionId)
  }
  if (isObjectId(actionId)) {
    this.handleActionId(actionId, gametime)
  }
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x12 = function (actionId) {
  if (isRightclickAction(actionId)) {
    this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
  } else if (isBasicAction(actionId)) {
    this.actions['basic'] = this.actions['basic'] + 1 || 1
  } else {
    this.actions['ability'] = this.actions['ability'] + 1 || 1
  }
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x13 = function (actionId) {
  this.actions['item'] = this.actions['item'] + 1 || 1
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x14 = function (actionId) {
  if (isRightclickAction(actionId)) {
    this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
  } else if (isBasicAction(actionId)) {
    this.actions['basic'] = this.actions['basic'] + 1 || 1
  } else {
    this.actions['ability'] = this.actions['ability'] + 1 || 1
  }
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x16 = function (selectMode, isAPM) {
  if (isAPM) {
    this.actions['select'] = this.actions['select'] + 1 || 1
    this._currentlyTrackedAPM++
  }
}

Player.prototype.handleOther = function (actionId) {
  switch (actionId) {
    case 0x17:
      this.actions['assigngroup'] = this.actions['assigngroup'] + 1 || 1
      this._currentlyTrackedAPM++
      break
    case 0x18:
      this.actions['selecthotkey'] = this.actions['selecthotkey'] + 1 || 1
      this._currentlyTrackedAPM++
      break
    case 0x1C:
    case 0x1D:
    case 0x66:
    case 0x67:
      this._currentlyTrackedAPM++
      break
    case 0x1E:
      this.actions['removeunit'] = this.actions['removeunit'] + 1 || 1
      this._currentlyTrackedAPM++
      break
    case 0x61:
      this.actions['esc'] = this.actions['esc'] + 1 || 1
      this._currentlyTrackedAPM++
      break
  }
}

Player.prototype.cleanup = function () {
  const apmSum = this.actions.timed.reduce((a, b) => a + b)
  this.apm = Math.round(apmSum / this.actions.timed.length)
  this.heroes = Object.values(this.heroes).sort((h1, h2) => h1.order - h2.order).reduce((aggregator, hero) => {
    delete hero['order']
    aggregator.push(hero)
    return aggregator
  }, [])
  delete this._currentlyTrackedAPM
}

module.exports = Player
