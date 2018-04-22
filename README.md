# w3gjs
[![Build Status](https://travis-ci.org/anXieTyPB/w3gjs.svg?branch=master)](https://travis-ci.org/anXieTyPB/w3gjs)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintainability](https://api.codeclimate.com/v1/badges/ebf0d0020d5dc9efba0e/maintainability)](https://codeclimate.com/github/anXieTyPB/w3gjs/maintainability)
## Parser
From scratch JavaScript implementation of a w3g parser for WarCraft 3 replay files.
Uses the excellent https://github.com/keichi/binary-parser to parse the replay file.

This parser is designed to be more modular than the original PHP parser.
You can easily add your custom action parsing logic by overriding the processTimeSlot() function
of a W3GReplay instance.

## Usage
```javascript
  //assuming that you cloned this repo into your project
  //sorry, no npm yet ;)
  const W3GReplay = require('./w3gjs')
  const replay = new W3GReplay('LastReplay.w3g')
```

The output is not yet well defined. Also please note that there is no support for versions <=1.07 yet.

### example output of the observers.w3g example replay:
```javascript
  {
    header:
      {
        magic: 'Warcraft III recorded game\u001a',
        offset: 68,
        compressedSize: 64215,
        headerVersion: '01000000',
        decompressedSize: 278306,
        compressedDataBlockCount: 34,
        gameIdentifier: 'PX3W',
        version: 29,
        buildNo: 6060,
        flags: '0080',
        replayLengthMS: 797920,
        checksum: 367128777,
      },    
    gameMetaDataDecoded: {
     meta:
       {
         gameName: 'cash',
         playerCount: 12,
         gameType: '01281900',
         languageId: 'b0f81200',
         playerList: [Array],
         gameStartRecord: '19',
         dataByteCount: 29440,
         slotRecordCount: 12,
         playerSlotRecords: [Array],
         randomSeed: 707624253,
         selectMode: '00',
         startSpotCount: 4
       },    
    },
    gameMetaInfo:
     {
       speed: 2,
       hideTerrain: 0,
       mapExplored: 1,
       alwaysVisible: 1,
       default: 1,
       observerMode: 2,
       teamsTogether: 0,
       empty: 0,
       fixedTeams: 0,
       fullSharedUnitControl: 0,
       randomHero: 0,
       randomRaces: 0,
       referees: 0,
       mapChecksum: '008ab7f1',
       mapName: 'Maps\\w3arena\\w3arena__twistedmeadows__v3.w3x',
       creator: 'GHost++'
     },    
    teams: { '0': [ 6 ], '3': [ 4 ], '24': [ 2, 3, 5, 7 ] },
    playerIdToName:
      {
        '2': 'PhxSimon',
        '3': 'GreenField',
        '4': 'S.o.K.o.L',
        '5': 'WoLv',
        '6': 'Stormhoof',
        '7': '()(0)()(o)'
      },    
    chatlog: [
      {
        playerId: 3,
        byteCount: 54,
        flags: 32,
        chatMode: 'ALL',
        message: 'Shortest load by player [WoLv] was 2.59 seconds.',
        timeMS: 0,
        playerName: 'GreenField'
      }
    ]
  }
```
## Contributing
There is no point in hiding the implementation of tools that the community can use. So please feel free to discuss in the issues section or provide a pull request if you think you can improve this parser.


## License

MIT license, see LICENSE.md file.
