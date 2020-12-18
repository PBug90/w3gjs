import W3GReplay from "../../../src/";
import path from "path";

const Parser = new W3GReplay();
it("parses a netease 1.29 replay properly", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "netease_129_obs.nwg")
  );
  expect(test.version).toBe("1.29");

  expect(test.players[1].name).toBe("rudan");
  expect(test.players[1].color).toBe("#282828");
  expect(test.observers.length).toBe(1);
  expect(test.matchup).toBe("NvN");
  expect(test.type).toBe("1on1");
  expect(test.players.length).toBe(2);
  expect(test.map).toEqual({
    checksum: "281f9d6a",
    checksumSha1: "c232d68286eb4604cc66db42d45e28017b78e3c4",
    file: "(4)TurtleRock.w3x",
    path: "Maps/1.29\\(4)TurtleRock.w3x",
  });
});

it("parses a standard 1.29 replay with observers properly", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "standard_129_obs.w3g")
  );

  expect(test.version).toBe("1.29");
  expect(test.players[1].name).toBe("S.o.K.o.L");
  expect(test.players[1].raceDetected).toBe("O");
  expect(test.players[1].id).toBe(4);
  expect(test.players[1].teamid).toBe(3);
  expect(test.players[1].color).toBe("#00781e");
  expect(test.players[1].units.summary).toEqual({
    opeo: 10,
    ogru: 5,
    orai: 6,
    ospm: 5,
    okod: 2,
  });
  expect(test.players[1].actions).toEqual({
    assigngroup: 38,
    rightclick: 1104,
    basic: 122,
    buildtrain: 111,
    ability: 59,
    item: 6,
    select: 538,
    removeunit: 0,
    subgroup: 0,
    selecthotkey: 751,
    esc: 0,
    timed: expect.any(Array),
  });

  expect(test.players[0].name).toBe("Stormhoof");
  expect(test.players[0].raceDetected).toBe("O");
  expect(test.players[0].color).toBe("#9b0000");
  expect(test.players[0].id).toBe(6);
  expect(test.players[0].teamid).toBe(0);
  expect(test.players[0].units.summary).toEqual({
    opeo: 11,
    ogru: 8,
    orai: 8,
    ospm: 4,
    okod: 3,
  });
  expect(test.players[0].actions).toEqual({
    assigngroup: 111,
    rightclick: 1595,
    basic: 201,
    buildtrain: 112,
    ability: 57,
    item: 5,
    select: 653,
    removeunit: 0,
    subgroup: 0,
    selecthotkey: 1865,
    esc: 4,
    timed: expect.any(Array),
  });

  expect(test.observers.length).toBe(4);
  expect(test.chat.length).toBeGreaterThan(2);
  expect(test.matchup).toBe("OvO");
  expect(test.type).toBe("1on1");
  expect(test.players.length).toBe(2);
  expect(test.parseTime).toBe(Math.round(test.parseTime));
  expect(test.map).toEqual({
    checksum: "008ab7f1",
    checksumSha1: "79ba7579f28e5ccfd741a1ebfbff95a56813086e",
    file: "w3arena__twistedmeadows__v3.w3x",
    path: "Maps\\w3arena\\w3arena__twistedmeadows__v3.w3x",
  });
});

it("evaluates APM correctly in a team game with an early leaver", async () => {
  const test = await Parser.parse(
    path.resolve(__dirname, "standard_129_3on3_leaver.w3g")
  );
  const firstLeftMinute = Math.ceil(
    test.players[0].currentTimePlayed / 1000 / 60
  );
  const postLeaveBlocks = test.players[0].actions.timed.slice(firstLeftMinute);
  const postLeaveApmSum = postLeaveBlocks.reduce((a, b) => a + b);
  expect(test.players[0].name).toBe("abmitdirpic");
  expect(postLeaveApmSum).toEqual(0);
  expect(test.players[0].apm).toEqual(98);
  expect(test.players[0].currentTimePlayed).toEqual(4371069);
  expect(Parser.msElapsed).toEqual(6433136);
});
