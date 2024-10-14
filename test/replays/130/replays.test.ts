import W3GReplay from "../../../src/";
import path from "path";
import { readFileSync } from "fs";
import { Validator } from "jsonschema";
import schema from "../../schema.json";

const Parser = new W3GReplay();
it("parses a standard 1.30.2 replay properly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "standard_1302.w3g"));
  expect(test.version).toBe("1.30.2+");
  expect(test.matchup).toBe("NvU");
  expect(test.players.length).toBe(2);
});

it("parses a standard 1.30.3 replay properly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "standard_1303.w3g"));
  expect(test.version).toBe("1.30.2+");
  expect(test.players.length).toBe(2);
});

it("parses a standard 1.30.4 replay properly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "standard_1304.w3g"));
  expect(test.version).toBe("1.30.2+");
  expect(test.players.length).toBe(2);
});

it("parses a standard 1.30.4 replay properly as buffer", async () => {
  const buffer: Buffer = readFileSync(
    path.resolve(__dirname, "standard_1304.w3g"),
  );
  const test = await Parser.parse(buffer);
  expect(test.version).toBe("1.30.2+");
  expect(test.players.length).toBe(2);
});

it("parses a standard 1.30.4 2on2 replay properly", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "standard_1304.2on2.w3g"),
  );
  expect(test.version).toBe("1.30.2+");
  expect(test.buildNumber).toBe(6061);
  expect(test.players.length).toBe(4);
  expect(test.players[2]).toMatchSnapshot();
});

it("parses a standard 1.30 replay properly", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "standard_130.w3g"));
  expect(test.version).toBe("1.30");
  expect(test.matchup).toBe("NvU");
  expect(test.type).toBe("1on1");
  expect(test.players[0].name).toBe("sheik");
  expect(test.players[0].race).toBe("U");
  expect(test.players[0].raceDetected).toBe("U");
  expect(test.players[1].name).toBe("123456789012345");
  expect(test.players[1].race).toBe("N");
  expect(test.players[1].raceDetected).toBe("N");
  expect(test.players.length).toBe(2);
  expect(test.players[0].heroes[0]).toEqual(
    expect.objectContaining({ id: "Udea", level: 6 }),
  );
  expect(test.players[0].heroes[1]).toEqual(
    expect.objectContaining({ id: "Ulic", level: 6 }),
  );
  expect(test.players[0].heroes[2]).toEqual(
    expect.objectContaining({ id: "Udre", level: 3 }),
  );
  expect(test.map).toEqual({
    file: "(4)TwistedMeadows.w3x",
    checksum: "c3cae01d",
    checksumSha1: "23dc614cca6fd7ec232fbba4898d318a90b95bc6",
    path: "Maps\\FrozenThrone\\(4)TwistedMeadows.w3x",
  });
});

it("parsing result has the correct schema", async () => {
  const test = await Parser.parse(path.resolve(__dirname, "standard_130.w3g"));
  const validatorInstance = new Validator();
  validatorInstance.validate(test, schema, { throwError: true });
});

it("resets elapsedMS instance property to 0 before parsing another replay", async () => {
  await Parser.parse(path.resolve(__dirname, "standard_130.w3g"));
  const msElapsed = Parser.msElapsed;
  await Parser.parse(path.resolve(__dirname, "standard_130.w3g"));
  const msElapsedTwo = Parser.msElapsed;
  expect(msElapsed).toEqual(msElapsedTwo);
});
