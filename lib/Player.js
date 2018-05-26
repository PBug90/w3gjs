const convert = require('./convert')
const reverseString = input => input.split('').reverse().join('')

function Player (id, name, teamid, color, race) {
  this.id = id
  this.name = name
  this.teamid = teamid
  this.color = convert.playerColor(color)
  this.race = race
  this.detectedRace = null
  this.units = {}
  this.upgrades = {}
  this.heroes = {}
  this.heroSkills = {}
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
  this.buildings = {}
  this._currentlyTrackedAPM = 0
  return this
}

Player.prototype.newActionTrackingSegment = function (timeTrackingInterval = 60000) {
  this.actions.timed.push(Math.floor(this._currentlyTrackedAPM * (60000.0 / timeTrackingInterval)))
  this._currentlyTrackedAPM = 0
}

Player.prototype.detectRaceByActionId = function (actionId) {
  switch (actionId[0]) {
    case 'e':
      this.detectedRace = 'N'
      break
    case 'o':
      this.detectedRace = 'O'
      break
    case 'h':
      this.detectedRace = 'H'
      break
    case 'u':
      this.detectedRace = 'U'
      break
  }
}

Player.prototype.handle0x10 = function (actionId) {
  if (typeof actionId === 'string') {
    actionId = reverseString(actionId)
  }

  switch (actionId[0]) {
    case 'A':
      this.heroSkills[actionId] = this.heroSkills[actionId] + 1 || 1
      break
    case 'R':
      this.upgrades[actionId] = this.heroSkills[actionId] + 1 || 1
      break
    case 'u':
    case 'e':
    case 'h':
    case 'o':
      if (!this.detectedRace) this.detectRaceByActionId(actionId)
      this.units[actionId] = this.units[actionId] + 1 || 1
      break
  }

  actionId[0] !== '0'
    ? this.actions['buildtrain'] = this.actions['buildtrain'] + 1 || 1
    : this.actions['ability'] = this.actions['ability'] + 1 || 1

  this._currentlyTrackedAPM++
}

Player.prototype.handle0x11 = function (actionId) {
  if (Array.isArray(actionId)) {
    if (actionId[0] <= 0x19 && actionId[1] === 0) {
      this.actions['basic'] = this.actions['basic'] + 1 || 1
    } else {
      this.actions['ability'] = this.actions['ability'] + 1 || 1
    }
  }
  if (['u', 'e', 'h', 'o'].indexOf(actionId[0]) >= 0) {
    this.buildings[actionId] = this.buildings[actionId] + 1 || 1
  }
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x12 = function (actionId) {
  if (actionId[0] === 0x03 && actionId[1] === 0) {
    this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
  } else if (actionId[0] <= 0x19 && actionId[1] === 0) {
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
  if (actionId[0] === 0x03 && actionId[1] === 0) {
    this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
  } else if (actionId[0] <= 0x19 && actionId[1] === 0) {
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

Player.prototype.handle0x17 = function () {
  this.actions['assigngroup'] = this.actions['assigngroup'] + 1 || 1
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x18 = function () {
  this.actions['selecthotkey'] = this.actions['selecthotkey'] + 1 || 1
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x1C = function () {
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x1D = function () {
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x1E = function () {
  this.actions['removeunit'] = this.actions['removeunit'] + 1 || 1
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x61 = function () {
  this.actions['esc'] = this.actions['esc'] + 1 || 1
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x66 = function () {
  this._currentlyTrackedAPM++
}

Player.prototype.handle0x67 = function () {
  this._currentlyTrackedAPM++
}

Player.prototype.cleanup = function () {
  delete this._currentlyTrackedAPM
}

module.exports = Player
