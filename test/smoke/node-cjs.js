/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");
const { default: W3GReplay } = require("../../dist/cjs/index.js");

async function run() {
  const parser = new W3GReplay();
  const result = await parser.parse(
    path.resolve(__dirname, "../replays/126/999.w3g"),
  );
  assert.strictEqual(result.version, "1.26");
  assert.strictEqual(result.players.length, 4);
  assert.strictEqual(result.matchup, "HUvHU");
  assert.strictEqual(result.type, "2on2");
  // eslint-disable-next-line no-console
  console.log("Node.js CJS smoke test passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
