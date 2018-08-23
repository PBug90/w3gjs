const W3GReplay = require('../index')
const Parser = new W3GReplay()

describe('Replay parsing tests', () => {
  it('parses a standard 1.29 replay with observers properly', () => {
    const test = Parser.parse(`./replays/standard_129_obs.w3g`)
    expect(test.header.magic).toBe('Warcraft III recorded game\u001a')
    expect(test.header.version).toBe(29)
    expect(test.players['4'].name).toBe('S.o.K.o.L')
    expect(test.players['4'].detectedRace).toBe('O')
    expect(test.players['4'].color).toBe('#50c878')
    expect(test.players['6'].name).toBe('Stormhoof')
    expect(test.players['6'].detectedRace).toBe('O')
    expect(test.players['6'].color).toBe('#800000')
    expect(test.observers.length).toBe(4)
    expect(test.teams['24']).toBe(undefined)
    expect(test.matchup).toBe('OvO')
    expect(Object.keys(test.players).length).toBe(2)
    expect(test.chatlog[0]).toEqual(expect.objectContaining({
      playerName: expect.any(String),
      chatMode: expect.any(String),
      message: expect.any(String)
    }))
  })

  it('parses a standard 1.26 replay properly', () => {
    const test = Parser.parse(`./replays/standard_126.w3g`)
    expect(test.header.magic).toBe('Warcraft III recorded game\u001a')
    expect(test.header.version).toBe(26)
    expect(test.observers.length).toBe(8)
    expect(test.players['11'].name).toBe('Happy_')
    expect(test.players['11'].detectedRace).toBe('U')
    expect(test.players['11'].color).toBe('#0000FF')
    expect(test.players['10'].name).toBe('u2.sok')
    expect(test.players['10'].detectedRace).toBe('H')
    expect(test.players['10'].color).toBe('#ff0000')
    expect(test.teams['12']).toBe(undefined)
    expect(test.matchup).toBe('HvU')
    expect(Object.keys(test.players).length).toBe(2)
  })

  it('parses a netease 1.29 replay properly', () => {
    const test = Parser.parse(`./replays/netease_129_obs.nwg`)
    expect(test.header.magic).toBe('Warcraft III recorded game\u001a')
    expect(test.header.version).toBe(29)

    expect(test.players['3'].name).toBe('rudan')
    expect(test.players['3'].color).toBe('#3eb489')
    expect(test.observers.length).toBe(1)
    expect(test.teams['24']).toBe(undefined)
    expect(test.matchup).toBe('NvN')
    expect(Object.keys(test.players).length).toBe(2)
  })

  it('parses a 2on2standard 1.29 replay properly', () => {
    const test = Parser.parse(`./replays/999.w3g`)
    expect(test.header.magic).toBe('Warcraft III recorded game\u001a')
    expect(test.header.version).toBe(26)
    expect(test.matchup).toBe('HUvHU')
    expect(Object.keys(test.players).length).toBe(4)
  })

  it('parses a standard 1.30 replay properly', () => {
    const test = Parser.parse(`./replays/standard_130.w3g`)
    expect(test.header.magic).toBe('Warcraft III recorded game\u001a')
    expect(test.header.version).toBe(30)
    expect(test.matchup).toBe('NvU')
    expect(test.players['3'].name).toBe('sheik')
    expect(test.players['3'].race).toBe('U')
    expect(test.players['3'].detectedRace).toBe('U')
    expect(test.players['5'].name).toBe('123456789012345')
    expect(test.players['5'].race).toBe('N')
    expect(test.players['5'].detectedRace).toBe('N')
    expect(Object.keys(test.players).length).toBe(2)
  })
})
