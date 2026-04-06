import W3GReplay, { ConcurrentParsingNotSupportedError } from "../src/";
import path from "node:path";

const replayPath = path.resolve(__dirname, "replays/126/999.w3g");

it("throws ConcurrentParsingNotSupportedError when parse is called while already parsing", async () => {
  const parser = new W3GReplay();
  const first = parser.parse(replayPath);
  await expect(parser.parse(replayPath)).rejects.toBeInstanceOf(
    ConcurrentParsingNotSupportedError,
  );
  await first;
});

it("allows parsing again after a parse completes", async () => {
  const parser = new W3GReplay();
  await parser.parse(replayPath);
  await expect(parser.parse(replayPath)).resolves.toBeDefined();
});

it("allows parsing again after a parse fails", async () => {
  const parser = new W3GReplay();
  await expect(parser.parse("nonexistent.w3g")).rejects.toThrow();
  await expect(parser.parse(replayPath)).resolves.toBeDefined();
});
