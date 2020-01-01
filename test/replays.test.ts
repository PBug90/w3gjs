import W3GReplay from '../src/W3GReplay'
import { Validator } from 'jsonschema'
import { readFileSync } from 'fs'

const Parser = new W3GReplay()

describe('Replay parsing tests', () => {
    it('parses a standard 1.29 replay with observers properly', () => {
        const test = Parser.parse('./replays/standard_129_obs.w3g')

        expect(test.version).toBe('1.29')
        expect(test.players[1].name).toBe('S.o.K.o.L')
        expect(test.players[1].raceDetected).toBe('O')
        expect(test.players[1].id).toBe(4)
        expect(test.players[1].teamid).toBe(3)
        expect(test.players[1].color).toBe('#00781e')
        expect(test.players[1].units.summary).toEqual({
            opeo: 10, ogru: 5, ostr: 1, orai: 6, ospm: 5, okod: 2
        })
        expect(test.players[1].actions).toEqual({
            assigngroup: 38,
            rightclick: 1104,
            basic: 122,
            buildtrain: 111,
            ability: 59,
            item: 6,
            select: 538,
            removeunit: 0,
            subgroup: 0,
            selecthotkey: 751,
            esc: 0,
            timed: expect.any(Array)
        })

        expect(test.players[0].name).toBe('Stormhoof')
        expect(test.players[0].raceDetected).toBe('O')
        expect(test.players[0].color).toBe('#9b0000')
        expect(test.players[0].id).toBe(6)
        expect(test.players[0].teamid).toBe(0)
        expect(test.players[0].units.summary).toEqual({
            opeo: 11, ogru: 8, ostr: 2, orai: 8, ospm: 4, okod: 3
        })
        expect(test.players[0].actions).toEqual({
            assigngroup: 111,
            rightclick: 1595,
            basic: 201,
            buildtrain: 112,
            ability: 57,
            item: 5,
            select: 653,
            removeunit: 0,
            subgroup: 0,
            selecthotkey: 1865,
            esc: 4,
            timed: expect.any(Array)
        })

        expect(test.observers.length).toBe(4)
        expect(test.chat.length).toBeGreaterThan(2)
        expect(test.matchup).toBe('OvO')
        expect(test.type).toBe('1on1')
        expect(test.players.length).toBe(2)
        expect(test.parseTime).toBe(Math.round(test.parseTime))
        expect(test.map).toEqual({
            checksum: '008ab7f1',
            file: 'w3arena__twistedmeadows__v3.w3x',
            path: 'Maps\\w3arena\\w3arena__twistedmeadows__v3.w3x'
        })
    })

    it('parses a standard 1.26 replay properly', () => {
        const test = Parser.parse('./replays/standard_126.w3g')
        expect(test.version).toBe('1.26')
        expect(test.observers.length).toBe(8)
        expect(test.players[1].name).toBe('Happy_')
        expect(test.players[1].raceDetected).toBe('U')
        expect(test.players[1].color).toBe('#0042ff')
        expect(test.players[0].name).toBe('u2.sok')
        expect(test.players[0].raceDetected).toBe('H')
        expect(test.players[0].color).toBe('#ff0303')
        expect(test.matchup).toBe('HvU')
        expect(test.type).toBe('1on1')
        expect(test.players.length).toBe(2)
        expect(test.map).toEqual({
            checksum: '51a1c63b',
            file: 'w3arena__amazonia__v3.w3x',
            path: 'Maps\\w3arena\\w3arena__amazonia__v3.w3x'
        })
    })

    it('parses a netease 1.29 replay properly', () => {
        const test = Parser.parse('./replays/netease_129_obs.nwg')
        expect(test.version).toBe('1.29')

        expect(test.players[1].name).toBe('rudan')
        expect(test.players[1].color).toBe('#282828')
        expect(test.observers.length).toBe(1)
        expect(test.matchup).toBe('NvN')
        expect(test.type).toBe('1on1')
        expect(test.players.length).toBe(2)
        expect(test.map).toEqual({
            checksum: '281f9d6a',
            file: '(4)TurtleRock.w3x',
            path: 'Maps/1.29\\(4)TurtleRock.w3x'
        })
    })

    it('parses a 2on2standard 1.29 replay properly', () => {
        const test = Parser.parse('./replays/999.w3g')
        expect(test.version).toBe('1.26')
        expect(test.players[0].id).toBe(2)
        expect(test.players[0].teamid).toBe(0)
        expect(test.players[1].id).toBe(4)
        expect(test.players[1].teamid).toBe(0)
        expect(test.players[2].id).toBe(3)
        expect(test.players[2].teamid).toBe(1)
        expect(test.players[3].id).toBe(5)
        expect(test.players[3].teamid).toBe(1)
        expect(test.matchup).toBe('HUvHU')
        expect(test.type).toBe('2on2')
        expect(test.players.length).toBe(4)
        expect(test.map).toEqual({
            checksum: 'b4230d1e',
            file: 'w3arena__maelstrom__v2.w3x',
            path: 'Maps\\w3arena\\w3arena__maelstrom__v2.w3x'
        })
    })

    it('parses a standard 1.30 replay properly', () => {
        const test = Parser.parse('./replays/standard_130.w3g')
        expect(test.version).toBe('1.30')
        expect(test.matchup).toBe('NvU')
        expect(test.type).toBe('1on1')
        expect(test.players[0].name).toBe('sheik')
        expect(test.players[0].race).toBe('U')
        expect(test.players[0].raceDetected).toBe('U')
        expect(test.players[1].name).toBe('123456789012345')
        expect(test.players[1].race).toBe('N')
        expect(test.players[1].raceDetected).toBe('N')
        expect(test.players.length).toBe(2)
        expect(test.players[0].heroes[0]).toEqual(expect.objectContaining({ id: 'Udea', level: 6 }))
        expect(test.players[0].heroes[1]).toEqual(expect.objectContaining({ id: 'Ulic', level: 6 }))
        expect(test.players[0].heroes[2]).toEqual(expect.objectContaining({ id: 'Udre', level: 3 }))
        expect(test.map).toEqual({
            file: '(4)TwistedMeadows.w3x',
            checksum: 'c3cae01d',
            path: 'Maps\\FrozenThrone\\(4)TwistedMeadows.w3x'
        })
    })

    it('parsing result has the correct schema', () => {
        const schema = require('./schema.json')
        const test = Parser.parse('./replays/standard_130.w3g')
        const validatorInstance = new Validator()
        validatorInstance.validate(test, schema, { throwError: true })
    })

    it('resets elapsedMS instance property to 0 before parsing another replay', () => {
        Parser.parse('./replays/standard_130.w3g')
        const msElapsed = Parser.msElapsed
        Parser.parse('./replays/standard_130.w3g')
        const msElapsedTwo = Parser.msElapsed
        expect(msElapsed).toEqual(msElapsedTwo)
    })

    it('parses a standard 1.30.2 replay properly', () => {
        const test = Parser.parse('./replays/standard_1302.w3g')
        expect(test.version).toBe('1.30.2+')
        expect(test.matchup).toBe('NvU')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.3 replay properly', () => {
        const test = Parser.parse('./replays/standard_1303.w3g')
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.4 replay properly', () => {
        const test = Parser.parse('./replays/standard_1304.w3g')
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.4 replay properly as buffer', () => {
        const buffer: Buffer = readFileSync('./replays/standard_1304.w3g')
        const test = Parser.parse(buffer)
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.4 2on2 replay properly', () => {
        const test = Parser.parse('./replays/standard_1304.2on2.w3g')
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(4)
    })

    it('parses a standard 1.30.4 1on1 tome of retraining', () => {
        const test = Parser.parse('./replays/standard_tomeofretraining_1.w3g')
        expect(test.version).toBe('1.31')
        expect(test.players.length).toBe(2)
        expect(test.players[0].heroes[0]).toEqual({
            id: 'Hamg',
            abilities: {
                AHab: 2,
                AHbz: 2
            },
            retrainingHistory: [
                {
                    abilities: {
                        AHab: 2,
                        AHwe: 2
                    },
                    time: 1136022
                }
            ],
            level: 4,
            abilityOrder: [
                {
                    time: 124366,
                    type: 'ability',
                    value: 'AHwe'
                },
                {
                    time: 234428,
                    type: 'ability',
                    value: 'AHab'
                },
                {
                    time: 293007,
                    type: 'ability',
                    value: 'AHwe'
                },
                {
                    time: 1060007,
                    type: 'ability',
                    value: 'AHab'
                },
                {
                    time: 1136022,
                    type: 'retraining'
                },
                {
                    time: 1140944,
                    type: 'ability',
                    value: 'AHbz'
                },
                {
                    time: 1141147,
                    type: 'ability',
                    value: 'AHbz'
                },
                {
                    time: 1141460,
                    type: 'ability',
                    value: 'AHab'
                },
                {
                    time: 1141569,
                    type: 'ability',
                    value: 'AHab'
                }
            ]
        })
    })

    it('parses a replay with action 0x7a successfully', () => {
        const test = Parser.parse('./replays/action0x7a.w3g')
        expect(test.version).toBe('1.31')
        expect(test.players.length).toBe(1)
    })
})
