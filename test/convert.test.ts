import convert from "../src/convert";

describe("mapFilename", () => {
  it("returns mapfilename if path separator is \\ ", () => {
    expect(convert.mapFilename("Maps\\test\\somemap.w3x")).toBe("somemap.w3x");
  });

  it("returns mapfilename if path separator is // ", () => {
    expect(convert.mapFilename("Maps//test//somemap.w3x")).toBe("somemap.w3x");
  });

  it("returns mapfilename if path separator is // and then \\ ", () => {
    expect(convert.mapFilename("Maps//test\\somemap.w3x")).toBe("somemap.w3x");
  });

  it("returns mapfilename if path separator is \\ and then // ", () => {
    expect(convert.mapFilename("Maps\\test//somemap.w3x")).toBe("somemap.w3x");
  });

  it("returns mapfilename if path separator is \\ and then // repeated multiple times ", () => {
    expect(convert.mapFilename("Maps\\test\\test2//test3//somemap.w3x")).toBe(
      "somemap.w3x",
    );
  });

  it("returns mapfilename if path separator is // and then \\ repeated multiple times ", () => {
    expect(convert.mapFilename("Maps//test//test2\\test3\\somemap.w3x")).toBe(
      "somemap.w3x",
    );
  });
});
