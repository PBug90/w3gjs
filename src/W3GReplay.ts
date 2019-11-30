import { ActionBlockList } from './parsers/actions'
import Player from './Player'
import convert from './convert'
import ReplayParser from './ReplayParser'
import {
    GameMetaDataDecoded,
    SlotRecord,
    GameDataBlock,
    ActionBlock,
    TimeSlotBlock,
    CommandDataBlock,
    ParserOutput,
    PlayerChatMessageBlock
} from './types'
import { sortPlayers } from './sort'

// Cannot import node modules directly because error with rollup
// https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
const { createHash } = require('crypto')
const {
    performance
} = require('perf_hooks')

class W3GReplay extends ReplayParser {
    players: { [key: string]: Player }

    observers: string[]

    chatlog: any

    playerActionTracker: {[key: string]: any[]} = {}

    id = ''

    leaveEvents: any[]

    w3mmd: any[]

    slots: any[]

    teams: any[]

    meta: GameMetaDataDecoded

    playerList: any[]

    totalTimeTracker = 0

    timeSegmentTracker = 0

    playerActionTrackInterval = 60000

    gametype = ''

    matchup = ''

    parseStartTime: number

    constructor () {
        super()
        this.on('gamemetadata', (metaData: GameMetaDataDecoded) => this.handleMetaData(metaData))
        this.on('gamedatablock', (block: GameDataBlock) => this.processGameDataBlock(block))
        this.on('timeslotblock', (block: TimeSlotBlock) => this.handleTimeSlot(block))
    }

    // gamedatablock timeslotblock commandblock actionblock
    parse ($buffer: string | Buffer): ParserOutput {
        this.parseStartTime = performance.now()
        this.buffer = Buffer.from('')
        this.filename = ''
        this.id = ''
        this.chatlog = []
        this.leaveEvents = []
        this.w3mmd = []
        this.players = {}
        this.totalTimeTracker = 0
        this.timeSegmentTracker = 0
        this.playerActionTrackInterval = 60000

        super.parse($buffer)

        this.chatlog = this.chatlog.map((elem: PlayerChatMessageBlock) => {
            return ({ ...elem, player: this.players[elem.playerId].name })
        })

        this.generateID()
        this.determineMatchup()
        this.cleanup()

        return this.finalize()
    }

    handleMetaData (metaData: GameMetaDataDecoded) {
        this.slots = metaData.playerSlotRecords
        this.playerList = [metaData.player, ...metaData.playerList]
        this.meta = metaData
        const tempPlayers: {[key: string]: GameMetaDataDecoded['player'] } = {}
        this.teams = []
        this.players = {}

        this.playerList.forEach((player: GameMetaDataDecoded['player']): void => {
            tempPlayers[player.playerId] = player
        })

        this.slots.forEach((slot: SlotRecord) => {
            if (slot.slotStatus > 1) {
                this.teams[slot.teamId] = this.teams[slot.teamId] || []
                this.teams[slot.teamId].push(slot.playerId)

                this.players[slot.playerId] = new Player(slot.playerId, tempPlayers[slot.playerId]
                    ? tempPlayers[slot.playerId].playerName
                    : 'Computer', slot.teamId, slot.color, slot.raceFlag)
            }
        })
    }

    processGameDataBlock (block: GameDataBlock) {
        switch (block.type) {
            case 31:
            case 30:
                this.totalTimeTracker += block.timeIncrement
                this.timeSegmentTracker += block.timeIncrement
                if (this.timeSegmentTracker > this.playerActionTrackInterval) {
                    // @ts-ignore
                    Object.values(this.players).forEach(p => p.newActionTrackingSegment())
                    this.timeSegmentTracker = 0
                }
                break
            case 32:
                block.timeMS = this.totalTimeTracker
                this.chatlog.push(block)
                break
            case 23:
                this.leaveEvents.push(block)
                break
        }
    }

    handleTimeSlot (block: TimeSlotBlock): void {
        block.actions.forEach((commandBlock: CommandDataBlock): void => {
            this.processCommandDataBlock(commandBlock)
        })
    }

    processCommandDataBlock (block: CommandDataBlock) {
        const currentPlayer = this.players[block.playerId]
        currentPlayer.currentTimePlayed = this.totalTimeTracker
        currentPlayer._lastActionWasDeselect = false
        try {
            ActionBlockList.parse(block.actions).forEach((action: ActionBlock): void => {
                this.handleActionBlock(action, currentPlayer)
            })
        } catch (ex) {
            console.error(ex)
        }
    }

    handleActionBlock (action: ActionBlock, currentPlayer: Player) {
        this.playerActionTracker[currentPlayer.id] = this.playerActionTracker[currentPlayer.id] || []
        this.playerActionTracker[currentPlayer.id].push(action)

        if (action.itemId && (action.itemId.value === 'tert' || action.itemId.value === 'tret')) {
            currentPlayer.handleRetraining(this.totalTimeTracker)
        }
        switch (action.actionId) {
            case 0x10:
                currentPlayer.handle0x10(action.itemId, this.totalTimeTracker)
                break
            case 0x11:
                currentPlayer.handle0x11(action.itemId, this.totalTimeTracker)
                break
            case 0x12:
                currentPlayer.handle0x12(action.itemId)
                break
            case 0x13:
                currentPlayer.handle0x13(action.itemId)
                break
            case 0x14:
                currentPlayer.handle0x14(action.itemId1)
                break
            case 0x16:
                if (action.selectMode === 0x02) {
                    currentPlayer._lastActionWasDeselect = true
                    currentPlayer.handle0x16(action.selectMode, true)
                } else {
                    if (currentPlayer._lastActionWasDeselect === false) {
                        currentPlayer.handle0x16(action.selectMode, true)
                    }
                    currentPlayer._lastActionWasDeselect = false
                }
                break
            case 0x17:
            case 0x18:
            case 0x1C:
            case 0x1D:
            case 0x1E:
            case 0x61:
            case 0x65:
            case 0x66:
            case 0x67:
                currentPlayer.handleOther(action.actionId)
                break
            case 0x6b:
                this.w3mmd.push(action)
                break
        }
    }

    isObserver (player: Player): boolean {
        return (player.teamid === 24 && this.header.version >= 29) || (player.teamid === 12 && this.header.version < 29)
    }

    determineMatchup (): void {
        const teamRaces: { [key: string]: string[] } = {}
        Object.values(this.players).forEach(p => {
            if (!this.isObserver(p)) {
                teamRaces[p.teamid] = teamRaces[p.teamid] || []
                teamRaces[p.teamid].push(p.raceDetected || p.race)
            }
        })
        this.gametype = Object.values(teamRaces).map(e => e.length).sort().join('on')
        this.matchup = Object.values(teamRaces).map(e => e.sort().join('')).sort().join('v')
    }

    generateID (): void {
        const players = Object.values(this.players).filter((p) => this.isObserver(p) === false).sort((player1, player2) => {
            if (player1.id < player2.id) {
                return -1
            }
            return 1
        }).reduce((accumulator, player) => {
            accumulator += player.name
            return accumulator
        }, '')

        const idBase = this.meta.randomSeed + players + this.meta.mapName
        this.id = createHash('sha256').update(idBase).digest('hex')
    }

    cleanup (): void {
        this.observers = []

        Object.values(this.players).forEach(p => {
            p.newActionTrackingSegment(this.playerActionTrackInterval)
            p.cleanup()
            if (this.isObserver(p)) {
                this.observers.push(p.name)
                delete this.players[p.id]
            }
        })

        if (this.header.version >= 29 && Object.prototype.hasOwnProperty.call(this.teams, '24')) {
            delete this.teams[24]
        } else if (Object.prototype.hasOwnProperty.call(this.teams, '12')) {
            delete this.teams[12]
        }
        delete this.slots
        delete this.playerList
        delete this.buffer
        delete this.decompressed
        delete this.gameMetaDataDecoded
        delete this.header.blocks
        delete this.apmTimeSeries
    }

    finalize (): ParserOutput {
        const settings = {
            referees: !!this.meta.referees,
            fixedTeams: !!this.meta.fixedTeams,
            fullSharedUnitControl: !!this.meta.fullSharedUnitControl,
            alwaysVisible: !!this.meta.alwaysVisible,
            hideTerrain: !!this.meta.hideTerrain,
            mapExplored: !!this.meta.mapExplored,
            teamsTogether: !!this.meta.teamsTogether,
            randomHero: !!this.meta.randomHero,
            randomRaces: !!this.meta.randomRaces,
            speed: this.meta.speed
        }

        const root = {
            id: this.id,
            gamename: this.meta.gameName,
            randomseed: this.meta.randomSeed,
            startSpots: this.meta.startSpotCount,
            observers: this.observers,
            players: Object.values(this.players).sort(sortPlayers),
            matchup: this.matchup,
            creator: this.meta.creator,
            type: this.gametype,
            chat: this.chatlog,
            apm: {
                trackingInterval: this.playerActionTrackInterval
            },
            map: {
                path: this.meta.mapName,
                file: convert.mapFilename(this.meta.mapName),
                checksum: this.meta.mapChecksum
            },
            version: convert.gameVersion(this.header.version),
            duration: this.header.replayLengthMS,
            expansion: this.header.gameIdentifier === 'PX3W',
            settings,
            parseTime: Math.round(performance.now() - this.parseStartTime)
        }
        return root
    }
}

export default W3GReplay
