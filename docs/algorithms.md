# identifier algorithm
In order to detect duplicate replays, an algorithm can be used to determine a unique identifier for each replay file.
That unique identifier must not rely on actual game data or game outcome and must only rely on information that is shared across all game participants regardless of time of replay saving.
Since replays of the same game can differ in binary (players leaving earlier than other players), a file hash is of no use. But one can use existing replay information to construct a hash as follows:

- create a list of all playing players that are NOT observers or referees
- sort this list by playername ascending
- concat all player names of the sorted list to form a list of player names without spaces
- concat the randomseed string representation with string generated in the previous step and the full map path
- use sha256 to generate a hash of the resulting string of the previous step

## example implementation

```javascript
W3GReplay.prototype.generateUUID = function () {
  let players = Object.values(this.players).filter((p) => this.isObserver(p) === false).sort((player1, player2) => {
    if (player1.id < player2.id) {
      return -1
    }
    return 1
  }).reduce((accumulator, player) => {
    accumulator += player.name
    return accumulator
  }, '')
   const uuidBase = this.meta.meta.randomSeed + players + this.meta.mapName
  this.uuid = crypto.createHash('sha256').update(uuidBase).digest('hex')
}
```

# game type algorithm

# matchup algorithm