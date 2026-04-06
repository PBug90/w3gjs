# w3gjs

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-PBug90-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/PBug90)
[![npm](https://img.shields.io/npm/v/w3gjs)](https://www.npmjs.com/package/w3gjs)
[![Node.js CI](https://github.com/PBug90/w3gjs/actions/workflows/testandbuild.yml/badge.svg)](https://github.com/PBug90/w3gjs/actions/workflows/testandbuild.yml)
[![Maintainability](https://qlty.sh/badges/01276c08-f34a-459c-b01d-a2b21b932485/maintainability.svg)](https://qlty.sh/gh/PBug90/projects/w3gjs)
[![Code Coverage](https://qlty.sh/badges/01276c08-f34a-459c-b01d-a2b21b932485/test_coverage.svg)](https://qlty.sh/gh/PBug90/projects/w3gjs)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Asynchronous, fully typed TypeScript implementation of a WarCraft 3 replay (`.w3g`) parser.

You can use the subcomponents to build your own parser or use the high-level API for standard melee game analysis.

> **Note:** Replays from game version <= 1.14 are not fully supported.

## Live Demo

Try the [browser-based replay parser](https://pbug90.github.io/wc3-replay-parser-web/) — a web app built on top of w3gjs that runs entirely in the browser.

## Installation

```
npm install w3gjs
```

## Usage

See the [examples](./examples) folder for TypeScript and JavaScript usage examples.

For the full API reference, see the [documentation](https://pbug90.github.io/w3gjs).

### High Level API

Best suited for parsing standard melee replays.

```typescript
import W3GReplay from "w3gjs";
const parser = new W3GReplay();
const result = await parser.parse("replay.w3g");
console.log(result);
```

```javascript
const W3GReplay = require("w3gjs").default;
const parser = new W3GReplay();

(async () => {
  const result = await parser.parse("replay.w3g");
  console.log(result);
})().catch(console.error);
```

### Low Level API

Extend `ReplayParser` or listen to its events to implement custom logic.

Two events are emitted:

- **`basic_replay_information`** — metadata parsed from the replay header
- **`gamedatablock`** — each game data block in order, fully parsed; check the `id` property to distinguish block types

```javascript
const ReplayParser = require("w3gjs/dist/lib/parsers/ReplayParser").default;
const fs = require("fs");

(async () => {
  const buffer = fs.readFileSync("./reforged1.w3g");
  const parser = new ReplayParser();
  parser.on("basic_replay_information", (info) => console.log(info));
  parser.on("gamedatablock", (block) => console.log(block));
  await parser.parse(buffer);
})().catch(console.error);
```

## Contributing

Contributions are welcome. Open an issue to discuss ideas or submit a pull request.

## Issues

Please include an example replay file when reporting a parsing issue.

## License

[MIT](./LICENSE.md)
