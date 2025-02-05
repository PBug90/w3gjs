import W3GReplay from "../../../src";
import path from "path";

const Parser = new W3GReplay();

it("recognizes a 'build haunted gold mine' command correctly and adds it to the player's buildings", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "goldmine test.w3g"));
  expect(test.players[0].buildings.summary).toHaveProperty("ugol", 1);
  expect(test.players[0].buildings.order).toEqual([{ id: "ugol", ms: 28435 }]);
});
