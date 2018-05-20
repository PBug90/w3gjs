const convert = require('./convert')

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
  this.actions = {}
  this.buildings = {}
  return this
}

Player.prototype.trackGameEntity = function (actionType, actionId) {
  if (typeof actionId === 'string') {
    actionId = actionId.split('').reverse().join('')
  }

  if (!this.detectedRace && typeof actionId === 'string') {
    if (actionId.startsWith('e')) {
      this.detectedRace = 'N'
    } else if (actionId.startsWith('o')) {
      this.detectedRace = 'O'
    } else if (actionId.startsWith('h')) {
      this.detectedRace = 'H'
    } else if (actionId.startsWith('u')) {
      this.detectedRace = 'U'
    }
  }

  switch (actionType) {
    case 0x10:
      this.handle0x10(actionId)
      break
    case 0x11:
      this.handle0x11(actionId)
      break
    case 0x12:
      this.handle0x12(actionId)
      break
    case 0x13:
      this.handle0x13(actionId)
      break
    case 0x14:
      this.handle0x14(actionId)
      break
    case 0x16:
      this.handle0x16()
      break
    case 0x17:
      this.handle0x17()
      break
    case 0x18:
      this.handle0x18()
      break
    case 0x19:
      this.handle0x19()
      break
    case 0x1D:
      this.handle0x1D()
      break
    case 0x1E:
      this.handle0x1E()
      break
  }
}

Player.prototype.handle0x10 = function (actionId) {
  if (actionId[0] !== '0') {
    this.actions['buildtrain'] = this.actions['buildtrain'] + 1 || 1
    if (actionId[0] === 'A') {
      this.heroSkills[actionId] = this.heroSkills[actionId] + 1 || 1
    } else if (actionId[0] === 'R') {
      this.upgrades[actionId] = this.heroSkills[actionId] + 1 || 1
    } else if (['u', 'e', 'h', 'o'].indexOf(actionId[0]) >= 0) {
      this.units[actionId] = this.units[actionId] + 1 || 1
    }
  } else {
    this.actions['ability'] = this.actions['ability'] + 1 || 1
  }
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
}

Player.prototype.handle0x12 = function (actionId) {
  if (Array.isArray(actionId)) {
    if (actionId[0] === 0x03 && actionId[1] === 0) {
      this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
    } else if (actionId[0] <= 0x19 && actionId[1] === 0) {
      this.actions['basic'] = this.actions['basic'] + 1 || 1
    }
  } else {
    this.actions['ability'] = this.actions['ability'] + 1 || 1
  }
}

Player.prototype.handle0x13 = function (actionId) {
  this.actions['item'] = this.actions['item'] + 1 || 1
}

Player.prototype.handle0x14 = function (actionId) {
  if (Array.isArray(actionId)) {
    if (actionId[0] === 0x03 && actionId[1] === 0) {
      this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
    } else if (actionId[0] <= 0x19 && actionId[1] === 0) {
      this.actions['basic'] = this.actions['basic'] + 1 || 1
    }
  } else {
    this.actions['ability'] = this.actions['ability'] + 1 || 1
  }
}

Player.prototype.handle0x16 = function (actionId) {
  this.actions['select'] = this.actions['select'] + 1 || 1
}

Player.prototype.handle0x17 = function (actionId) {
  this.actions['assignhotkey'] = this.actions['assignhotkey'] + 1 || 1
}

Player.prototype.handle0x18 = function (actionId) {
  this.actions['selecthotkey'] = this.actions['selecthotkey'] + 1 || 1
}

Player.prototype.handle0x19 = function (actionId) {
  this.actions['subgroup'] = this.actions['subgroup'] + 1 || 1
}

Player.prototype.handle0x1D = function (actionId) {

}

Player.prototype.handle0x1E = function (actionId) {
  this.actions['removeunit'] = this.actions['removeunit'] + 1 || 1
}

module.exports = Player
