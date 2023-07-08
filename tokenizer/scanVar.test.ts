import { assertEquals, it } from "../testUtils.ts";
import { TokenizerContext } from "./TokenizerContext.ts";
import { scanVar } from "./scanVar.ts";

const validTokens = [
  "x",
  "abc",
  "abc123",
  "abc_123",
  "abcABC",
  "ABC",
  "$true",
  "$TRUE",
];

validTokens.forEach((token) => {
  it(`scans "${token}"`, () => {
    const ctx = new TokenizerContext({ code: token, position: 0 });
    const result = scanVar(ctx);
    assertEquals(result, {
      type: "var",
      start: 0,
      end: token.length,
    });
  });
});

const invalidTokens = [
  "1",
  "あ",
  "",
  "%",
];

invalidTokens.forEach((token) => {
  it(`does not scan "${token}"`, () => {
    const ctx = new TokenizerContext({ code: token, position: 0 });
    const result = scanVar(ctx);
    assertEquals(result, null);
  });
});

it("scans a variable in the middle of the code", () => {
  const ctx = new TokenizerContext({ code: "abc def ghi", position: 4 });
  const result = scanVar(ctx);
  assertEquals(result, {
    type: "var",
    start: 4,
    end: 7,
  });
});
