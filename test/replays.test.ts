import W3GReplay from '../src/W3GReplay'
import { Validator } from 'jsonschema'

const Parser = new W3GReplay()

describe('Replay parsing tests', () => {
    it('parses a standard 1.29 replay with observers properly', () => {
        const test = Parser.parse(`./replays/standard_129_obs.w3g`)
        expect(test.version).toBe('1.29')
        expect(test.players[1].name).toBe('S.o.K.o.L')
        expect(test.players[1].raceDetected).toBe('O')
        expect(test.players[1].id).toBe(4)
        expect(test.players[1].teamid).toBe(3)
        expect(test.players[1].color).toBe('#50c878')
        expect(test.players[0].name).toBe('Stormhoof')
        expect(test.players[0].raceDetected).toBe('O')
        expect(test.players[0].color).toBe('#800000')
        expect(test.players[0].id).toBe(6)
        expect(test.players[0].teamid).toBe(0)
        expect(test.observers.length).toBe(4)
        expect(test.chat.length).toBeGreaterThan(2)
        expect(test.matchup).toBe('OvO')
        expect(test.type).toBe('1on1')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.26 replay properly', () => {
        const test = Parser.parse(`./replays/standard_126.w3g`)
        expect(test.version).toBe('1.26')
        expect(test.observers.length).toBe(8)
        expect(test.players[1].name).toBe('Happy_')
        expect(test.players[1].raceDetected).toBe('U')
        expect(test.players[1].color).toBe('#0000FF')
        expect(test.players[0].name).toBe('u2.sok')
        expect(test.players[0].raceDetected).toBe('H')
        expect(test.players[0].color).toBe('#ff0000')
        expect(test.matchup).toBe('HvU')
        expect(test.type).toBe('1on1')
        expect(test.players.length).toBe(2)
    })

    it('parses a netease 1.29 replay properly', () => {
        const test = Parser.parse(`./replays/netease_129_obs.nwg`)
        expect(test.version).toBe('1.29')

        expect(test.players[1].name).toBe('rudan')
        expect(test.players[1].color).toBe('#3eb489')
        expect(test.observers.length).toBe(1)
        expect(test.matchup).toBe('NvN')
        expect(test.type).toBe('1on1')
        expect(test.players.length).toBe(2)
    })

    it('parses a 2on2standard 1.29 replay properly', () => {
        const test = Parser.parse(`./replays/999.w3g`)
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
    })

    it('parses a standard 1.30 replay properly', () => {
        const test = Parser.parse(`./replays/standard_130.w3g`)
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
    })

    it('parsing result has the correct schema', () => {
        const schema = require('./schema.json')
        const test = Parser.parse(`./replays/standard_130.w3g`)
        const validatorInstance = new Validator()
        validatorInstance.validate(test, schema, { throwError: true })
    })

    it('resets elapsedMS instance property to 0 before parsing another replay', () => {
        Parser.parse(`./replays/standard_130.w3g`)
        const msElapsed = Parser.msElapsed
        Parser.parse(`./replays/standard_130.w3g`)
        const msElapsedTwo = Parser.msElapsed
        expect(msElapsed).toEqual(msElapsedTwo)
    })

    it('parses a standard 1.30.2 replay properly', () => {
        const test = Parser.parse(`./replays/standard_1302.w3g`)
        expect(test.version).toBe('1.30.2+')
        expect(test.matchup).toBe('NvU')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.3 replay properly', () => {
        const test = Parser.parse(`./replays/standard_1303.w3g`)
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.4 replay properly', () => {
        const test = Parser.parse(`./replays/standard_1304.w3g`)
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(2)
    })

    it('parses a standard 1.30.4 2on2 replay properly', () => {
        const test = Parser.parse(`./replays/standard_1304.2on2.w3g`)
        expect(test.version).toBe('1.30.2+')
        expect(test.players.length).toBe(4)
    })
})
