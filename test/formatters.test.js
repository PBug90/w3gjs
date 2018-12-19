const formatters = require('../dist/lib/parsers/formatters')

describe('chatModeFormatter', () => {
  const {chatModeFormatter} = formatters
  it('correctly handles 0 as ALL', () => {
    expect(chatModeFormatter(0)).toBe('ALL')
  })
  it('correctly handles 1 as ALLY', () => {
    expect(chatModeFormatter(1)).toBe('ALLY')
  })
  it('correctly handles 2 as OBS', () => {
    expect(chatModeFormatter(2)).toBe('OBS')
  })
  for (let i = 0; i < 24; i++) {
    it(`correctly handles private message to slot ${i}`, () => {
      expect(chatModeFormatter(3 + i)).toBe(`PRIVATE${i + 3}`)
    })
  }
})
