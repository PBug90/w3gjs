import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import W3GReplay from "../../dist/esm/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parser = new W3GReplay();
const result = await parser.parse(
  path.resolve(__dirname, "../replays/126/999.w3g"),
);
assert.strictEqual(result.version, "1.26");
assert.strictEqual(result.players.length, 4);
assert.strictEqual(result.matchup, "HUvHU");
assert.strictEqual(result.type, "2on2");
// eslint-disable-next-line no-console
console.log("Node.js ESM smoke test passed");
