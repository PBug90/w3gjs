# w3gjs
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

## Contributing
There is no point in hiding the implementation of tools that the community can use. So please feel free to discuss in the issues section or provide a pull request if you think you can improve this parser.


## License

MIT license, see LICENSE.md file.
