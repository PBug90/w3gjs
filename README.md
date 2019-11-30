# w3gjs
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/PBug90/w3gjs.svg?branch=master)](https://travis-ci.org/w3gjs/w3gjs)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8499316ea1ee69d2dd0b/test_coverage)](https://codeclimate.com/github/PBug90/w3gjs/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/8499316ea1ee69d2dd0b/maintainability)](https://codeclimate.com/github/PBug90/w3gjs/maintainability)
## Parser
From scratch JavaScript implementation of a w3g parser for WarCraft 3 replay files.
Uses the excellent https://github.com/keichi/binary-parser to parse the replay file.

This parser is aimed to be more modular than other parsers.
You can easily add your custom action parsing logic by overriding the processTimeSlot() function
of a W3GReplay instance or by listening for one of the five main events:



**It does not fully support replays of game version <= 1.14.**

## Installation
```
  npm install w3gjs
```

## Usage

### High Level API

```javascript
  const W3GReplay = require('w3gjs')
  const Parser = new W3GReplay()
  const replay = Parser.parse('./replays/sample1.w3g')
  console.log(replay)
```

### Low Level API
Low level API allows you to either implement your own logic on top of the ReplayParser class by extending it or 
to register callbacks to listen for parser events as it encounters the different kinds of blocks in a replay.

```javascript
const W3GReplay = require('w3gjs')
const Parser = new W3GReplay()

Parser.on('gamemetadata', (metadata) => console.log(metadata))
Parser.on('gamedatablock', (block) => console.log('game data block.'))
Parser.on('timeslotblock', (block) => console.log('time slot block.', Parser.msElapsed))
Parser.on('commandblock', (block) => console.log('command block.'))
Parser.on('actionblock', (block) => console.log('action block.'))

Parser.parse('./replays/999.w3g')
```

### Example output of the observers.w3g example replay
Check the example_output.json file in the root of this repository.

### Example demo app
You can see the parser in action here and parse your own replays aswell:
https://enigmatic-springs-58797.herokuapp.com/

## Contributing
There is no point in hiding the implementation of tools that the community can use. So please feel free to discuss in the issues section or provide a pull request if you think you can improve this parser.

## Issues
If you have an issue using this library please use the issue section and provide an example replay file.

## License

MIT license, see LICENSE.md file.
