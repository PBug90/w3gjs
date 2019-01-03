# w3gjs
[![Build Status](https://travis-ci.org/anXieTyPB/w3gjs.svg?branch=master)](https://travis-ci.org/anXieTyPB/w3gjs)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintainability](https://api.codeclimate.com/v1/badges/ebf0d0020d5dc9efba0e/maintainability)](https://codeclimate.com/github/anXieTyPB/w3gjs/maintainability)
## Parser
From scratch JavaScript implementation of a w3g parser for WarCraft 3 replay files.
Uses the excellent https://github.com/keichi/binary-parser to parse the replay file.

This parser is aimed to be more modular than other parsers.
You can easily add your custom action parsing logic by overriding the processTimeSlot() function
of a W3GReplay instance.

**It does not fully support replays of game version <= 1.14.**

## Usage
```javascript
  const W3GReplay = require('./w3gjs')
  const Parser = new W3GReplay('./replays/sample1.w3g')
  const replay = Parser.parse()
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
