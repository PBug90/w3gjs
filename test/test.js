/* global describe it */

const {expect} = require('chai')
const W3GReplay = require('../index')
const Parser = new W3GReplay()

describe('Replay parsing tests', () => {
  it('parses a standard 1.29 replay with observers properly', () => {
    const test = Parser.parse(`./replays/standard_129_obs.w3g`)
    expect(test.header.magic).to.equal('Warcraft III recorded game\u001a')
    expect(test.header.version).to.equal(29)
    expect(test.players['4'].name).to.equal('S.o.K.o.L')
    expect(test.players['4'].detectedRace).to.equal('O')
    expect(test.players['4'].color).to.equal('#50c878')
    expect(test.players['6'].name).to.equal('Stormhoof')
    expect(test.players['6'].detectedRace).to.equal('O')
    expect(test.players['6'].color).to.equal('#800000')
    expect(test.observers).to.have.lengthOf(4)
    expect(test.teams['24']).to.equal(undefined)
    expect(test.matchup).to.equal('OvO')
    expect(Object.keys(test.players)).to.have.lengthOf(2)
  })

  it('parses a standard 1.26 replay properly', () => {
    const test = Parser.parse(`./replays/standard_126.w3g`)
    expect(test.header.magic).to.equal('Warcraft III recorded game\u001a')
    expect(test.header.version).to.equal(26)
    expect(test.observers).to.have.lengthOf(8)
    expect(test.players['11'].name).to.equal('Happy_')
    expect(test.players['11'].detectedRace).to.equal('U')
    expect(test.players['11'].color).to.equal('#0000FF')
    expect(test.players['10'].name).to.equal('u2.sok')
    expect(test.players['10'].detectedRace).to.equal('H')
    expect(test.players['10'].color).to.equal('#ff0000')
    expect(test.teams['12']).to.equal(undefined)
    expect(test.matchup).to.equal('HvU')
    expect(Object.keys(test.players)).to.have.lengthOf(2)
  })

  it('parses a netease 1.29 replay properly', () => {
    const test = Parser.parse(`./replays/netease_129_obs.nwg`)
    expect(test.header.magic).to.equal('Warcraft III recorded game\u001a')
    expect(test.header.version).to.equal(29)

    expect(test.players['3'].name).to.equal('rudan')
    expect(test.players['3'].color).to.equal('#3eb489')
    expect(test.observers).to.have.lengthOf(1)
    expect(test.teams['24']).to.equal(undefined)
    expect(test.matchup).to.equal('NvN')
    expect(Object.keys(test.players)).to.have.lengthOf(2)
  })

  it('parses a 2on2standard 1.29 replay properly', () => {
    const test = Parser.parse(`./replays/999.w3g`)
    expect(test.header.magic).to.equal('Warcraft III recorded game\u001a')
    expect(test.header.version).to.equal(26)
    expect(test.matchup).to.equal('HUvHU')
    expect(Object.keys(test.players)).to.have.lengthOf(4)
  })
})
