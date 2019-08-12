import convert from './convert'
import { items, units, buildings, upgrades, abilityToHero } from './mappings'
import { Races, ItemID } from './types'

/**
 * Helpers
 */
const isRightclickAction = (input: number[]) => input[0] === 0x03 && input[1] === 0
const isBasicAction = (input: number[]) => input[0] <= 0x19 && input[1] === 0

interface HeroInfo {
    level: number;
    abilities: { [key: string]: number };
    order: number;
    id: string;
}

class Player {
    id: number

    name: string

    teamid: number

    color: string

    race: Races

    raceDetected: string

    units: {
        summary: { [key: string]: number };
        order: { id: string; ms: number }[];
    }

    upgrades: {
        summary: { [key: string]: number };
        order: { id: string; ms: number }[];
    }

    items: {
        summary: { [key: string]: number };
        order: { id: string; ms: number }[];
    }

    buildings: {
        summary: { [key: string]: number };
        order: { id: string; ms: number }[];
    }

    heroes: HeroInfo[]

    heroCollector: {[key: string]: HeroInfo}

    heroSkills: { [key: string]: number }

    heroCount: number

    actions: {
        timed: any[];
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
    }

    _currentlyTrackedAPM: number

    _lastActionWasDeselect: boolean

    currentTimePlayed: number

    apm: number

    constructor (id: number, name: string, teamid: number, color: number, race: Races) {
        this.id = id
        this.name = name
        this.teamid = teamid
        this.color = convert.playerColor(color)
        this.race = race
        this.raceDetected = ''
        this.units = { summary: {}, order: [] }
        this.upgrades = { summary: {}, order: [] }
        this.items = { summary: {}, order: [] }
        this.buildings = { summary: {}, order: [] }
        this.heroes = []
        this.heroCollector = {}
        this.heroSkills = {}
        this.heroCount = 0
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
            esc: 0
        }
        this._currentlyTrackedAPM = 0
        this._lastActionWasDeselect = false
        this.currentTimePlayed = 0
        this.apm = 0
        return this
    }

    newActionTrackingSegment (timeTrackingInterval = 60000): void {
        this.actions.timed.push(Math.floor(this._currentlyTrackedAPM * (60000.0 / timeTrackingInterval)))
        this._currentlyTrackedAPM = 0
    }

    detectRaceByActionId (actionId: string): void {
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

    handleStringencodedItemID (actionId: string, gametime: number): void {
        if (units[actionId]) {
            this.units.summary[actionId] = this.units.summary[actionId] + 1 || 1
            this.units.order.push({ id: actionId, ms: gametime })
        } else if (items[actionId]) {
            this.items.summary[actionId] = this.items.summary[actionId] + 1 || 1
            this.items.order.push({ id: actionId, ms: gametime })
        } else if (buildings[actionId]) {
            this.buildings.summary[actionId] = this.buildings.summary[actionId] + 1 || 1
            this.buildings.order.push({ id: actionId, ms: gametime })
        } else if (upgrades[actionId]) {
            this.upgrades.summary[actionId] = this.upgrades.summary[actionId] + 1 || 1
            this.upgrades.order.push({ id: actionId, ms: gametime })
        }
    }

    handleHeroSkill (actionId: string): void {
        if (this.heroCollector[abilityToHero[actionId]] === undefined) {
            this.heroCount += 1
            this.heroCollector[abilityToHero[actionId]] = { level: 0, abilities: {}, order: this.heroCount, id: abilityToHero[actionId] }
        }
        this.heroCollector[abilityToHero[actionId]].level += 1
        this.heroCollector[abilityToHero[actionId]].abilities[actionId] = this.heroCollector[abilityToHero[actionId]].abilities[actionId] || 0
        this.heroCollector[abilityToHero[actionId]].abilities[actionId] += 1
    }

    handle0x10 (itemid: ItemID, gametime: number): void {
        switch (itemid.value[0]) {
            case 'A':
                this.heroSkills[itemid.value] = this.heroSkills[itemid.value] + 1 || 1
                this.handleHeroSkill(itemid.value)
                break
            case 'R':
                this.handleStringencodedItemID(itemid.value, gametime)
                break
            case 'u':
            case 'e':
            case 'h':
            case 'o':
                if (!this.raceDetected) {
                    this.detectRaceByActionId(itemid.value)
                }
                this.handleStringencodedItemID(itemid.value, gametime)
                break
            default:
                this.handleStringencodedItemID(itemid.value, gametime)
        }

        itemid.value[0] !== '0'
            ? this.actions['buildtrain'] = this.actions['buildtrain'] + 1 || 1
            : this.actions['ability'] = this.actions['ability'] + 1 || 1

        this._currentlyTrackedAPM++
    }

    handle0x11 (itemid: ItemID, gametime: number): void {
        this._currentlyTrackedAPM++
        if (itemid.type === 'alphanumeric') {
            if (itemid.value[0] <= 0x19 && itemid.value[1] === 0) {
                this.actions['basic'] = this.actions['basic'] + 1 || 1
            } else {
                this.actions['ability'] = this.actions['ability'] + 1 || 1
            }
        } else {
            this.handleStringencodedItemID(itemid.value, gametime)
        }
    }

    handle0x12 (itemid: ItemID): void {
        if (isRightclickAction(itemid.value)) {
            this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
        } else if (isBasicAction(itemid.value)) {
            this.actions['basic'] = this.actions['basic'] + 1 || 1
        } else {
            this.actions['ability'] = this.actions['ability'] + 1 || 1
        }
        this._currentlyTrackedAPM++
    }

    handle0x13 (itemid: string): void {
        this.actions['item'] = this.actions['item'] + 1 || 1
        this._currentlyTrackedAPM++
    }

    handle0x14 (itemid: ItemID): void {
        if (isRightclickAction(itemid.value)) {
            this.actions['rightclick'] = this.actions['rightclick'] + 1 || 1
        } else if (isBasicAction(itemid.value)) {
            this.actions['basic'] = this.actions['basic'] + 1 || 1
        } else {
            this.actions['ability'] = this.actions['ability'] + 1 || 1
        }
        this._currentlyTrackedAPM++
    }

    handle0x16 (selectMode: number, isAPM: boolean) {
        if (isAPM) {
            this.actions['select'] = this.actions['select'] + 1 || 1
            this._currentlyTrackedAPM++
        }
    }

    handleOther (actionId: number) {
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

    cleanup (): void {
        const apmSum = this.actions.timed.reduce((a: number, b: number): number => a + b)
        this.apm = Math.round(apmSum / this.actions.timed.length)
        this.heroes = Object.values(this.heroCollector).sort((h1, h2) => h1.order - h2.order).reduce((aggregator, hero) => {
            delete hero['order']
            aggregator.push(hero)
            return aggregator
        }, <HeroInfo[]>[])

        delete this._currentlyTrackedAPM
    }
}

export default Player
