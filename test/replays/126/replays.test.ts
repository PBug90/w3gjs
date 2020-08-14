import W3GReplay from "../../../src/";
import path from "path";

const Parser = new W3GReplay();
it("parses a 2on2standard 1.29 replay properly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "999.w3g"));
  expect(test.version).toBe("1.26");
  expect(test.players[0].id).toBe(2);
  expect(test.players[0].teamid).toBe(0);
  expect(test.players[1].id).toBe(4);
  expect(test.players[1].teamid).toBe(0);
  expect(test.players[2].id).toBe(3);
  expect(test.players[2].teamid).toBe(1);
  expect(test.players[3].id).toBe(5);
  expect(test.players[3].teamid).toBe(1);
  expect(test.matchup).toBe("HUvHU");
  expect(test.type).toBe("2on2");
  expect(test.players.length).toBe(4);
  expect(test.map).toEqual({
    checksum: "b4230d1e",
    file: "w3arena__maelstrom__v2.w3x",
    path: "Maps\\w3arena\\w3arena__maelstrom__v2.w3x",
  });
});

it("parses a standard 1.26 replay properly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "standard_126.w3g"));
  expect(test.version).toBe("1.26");
  expect(test.observers.length).toBe(8);
  expect(test.players[1].name).toBe("Happy_");
  expect(test.players[1].raceDetected).toBe("U");
  expect(test.players[1].color).toBe("#0042ff");
  expect(test.players[0].name).toBe("u2.sok");
  expect(test.players[0].raceDetected).toBe("H");
  expect(test.players[0].color).toBe("#ff0303");
  expect(test.matchup).toBe("HvU");
  expect(test.type).toBe("1on1");
  expect(test.players.length).toBe(2);
  expect(test.map).toEqual({
    checksum: "51a1c63b",
    file: "w3arena__amazonia__v3.w3x",
    path: "Maps\\w3arena\\w3arena__amazonia__v3.w3x",
  });
});
