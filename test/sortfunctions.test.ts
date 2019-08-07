const sorters = require('../src/sort')

describe('sortPlayers', () => {
    it('propery sorts a player list', () => {
        const players = [
            {
                id: 8,
                teamid:1
            },
            {
                id : 4,
                teamid:1
            },
            {
                id: 3,
                teamid: 0
            },
            {
                id: 1,
                teamid: 0
            }
        ]
        
        expect(players.sort(sorters.sortPlayers)).toEqual([
            {
                id: 1,
                teamid: 0
            },
            {
                id: 3,
                teamid: 0
            },          
            {
                id : 4,
                teamid:1
            },
            {
                id : 8,
                teamid:1
            },                          
        ])
    })
})
