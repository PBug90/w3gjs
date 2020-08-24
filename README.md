# w3gjs
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Build Status](https://travis-ci.org/PBug90/w3gjs.svg?branch=master)](https://travis-ci.org/w3gjs/w3gjs)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8499316ea1ee69d2dd0b/test_coverage)](https://codeclimate.com/github/PBug90/w3gjs/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/8499316ea1ee69d2dd0b/maintainability)](https://codeclimate.com/github/PBug90/w3gjs/maintainability)

## Parser
From scratch asynchronous, fully typed and tested TypeScript implementation of a w3g parser for WarCraft 3 replay files.
Zero external dependencies.

You can use the subcomponents to create your own parser that suits your requirements or just use the high-level parser output that is best suited for 
standard game mode game analysis.



**It does not fully support replays of game version <= 1.14.**

## Installation
```
  npm install w3gjs
```

## Usage

Check out the examples folder of this repository to find usage examples for both typescript and javascript.

For detailed API documentation check out https://pbug90.github.io/w3gjs
Please keep in mind that as of now, parallel parsing with the same W3GReplay instance is not yet supported. Instantiate multiple instances or parse replays sequentially.

### High Level API

High level API is best suited to parse standard melee replays. 

```javascript
const W3GReplay = require('w3gjs').default
const parser = new W3GReplay();

( async () => {
  const result = await parser.parse("replay.w3g")
  console.log(result)
})().catch(console.error);
```


### Low Level API
Low level API allows you to either implement your own logic on top of the ReplayParser class by extending it or 
to register callbacks to listen for parser events as it encounters the different kinds of blocks in a replay.

In previous versions, multiple events were emitted. In version 2 there are exactly two events. 

**basic_replay_information** provides you with metadata about the replay
that was parsed from the header information. 

The **gamedatablock** event provides you with all blocks that make up the actual game data, fully parsed and in correct order. You can check their *id* property to distinguish the blocks from each other. For more information, consult the auto-generated docs for properties of specific blocks.

```javascript
const ReplayParser = require('w3gjs/dist/lib/parsers/ReplayParser').default;
const fs = require('fs')
( async () => {
  const buffer = fs.readFileSync("./reforged1.w3g")
  const parser = new ReplayParser();
  parser.on("basic_replay_information", (info) => console.log(info))
  parser.on("gamedatablock", (block) => console.log(block))
  const result = await parser.parse(buffer)
  console.log(result)
})().catch(console.error)
```

## Contributing
There is no point in hiding the implementation of tools that the community can use. So please feel free to discuss in the issues section or provide a pull request if you think you can improve this parser.

## Issues
If you have an issue using this library please use the issue section and provide an example replay file.

## License

MIT license, see LICENSE.md file.
