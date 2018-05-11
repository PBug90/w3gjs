/* global describe it */

const {expect} = require('chai')
const W3GReplay = require('../index')

describe('Replay parsing tests', () => {
  it('parses a replay with observers properly', () => {
    const test = new W3GReplay(`./replays/observers.w3g`)

    expect(test.header.magic).to.equal('Warcraft III recorded game\u001a')
    expect(test.teams['24']).to.be.an('array')
    expect(test.teams['24']).to.have.lengthOf(4)
    expect(test.players['4'].playerName).to.equal('S.o.K.o.L')
    expect(test.players['6'].playerName).to.equal('Stormhoof')
  })

  it('parses a netease replay properly', () => {
    const test = new W3GReplay(`./replays/netease1.nwg`)

    expect(test.header.magic).to.equal('Warcraft III recorded game\u001a')
    expect(test.teams['24']).to.be.an('array')
    expect(test.players['3'].playerName).to.equal('rudan')
  })
})
