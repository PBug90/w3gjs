/*
    This snippet uses the ReplayParser gamedatablock event
    to log all player actions in the game to the console
*/
import { ReplayParser } from "w3gjs";
import { readFileSync } from "fs";
const parser = new ReplayParser();
parser.on("gamedatablock", (block) => {
  if (block.id === 0x1f) {
    block.commandBlocks.forEach((commandBlock) => {
      console.log(
        commandBlock.playerId +
          " dispatched actions: " +
          JSON.stringify(commandBlock.actions)
      );
    });
  }
});
parser
  .parse(readFileSync("./replay.w3g"))
  .then((result) => {
    console.log(result);
  })
  .catch(console.error);
