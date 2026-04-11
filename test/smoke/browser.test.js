/**
 * @jest-environment jsdom
 */

// Browser shim: setImmediate is Node-only; queueMicrotask is the browser equivalent.
global.setImmediate = (fn) => queueMicrotask(fn);

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { default: W3GReplay } = require("../../dist/cjs/index.js");

// In a browser, the replay file would be read via the File API and passed as a
// Buffer/ArrayBuffer — not a file path. This test simulates that pattern.
test("parses a replay buffer in a jsdom browser-like environment", async () => {
  const buffer = fs.readFileSync(
    path.resolve(__dirname, "../replays/126/999.w3g"),
  );
  expect(global.window).toBeDefined();
  const parser = new W3GReplay();
  const result = await parser.parse(buffer);
  expect(result.version).toBe("1.26");
  expect(result.players.length).toBe(4);
  expect(result.matchup).toBe("HUvHU");
  expect(result.type).toBe("2on2");
}, 30000);
