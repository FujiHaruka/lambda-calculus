import { assertEquals, assertThrows, describe, it } from "../utils/testUtils.ts";
import { TokenizerContext } from "./TokenizerContext.ts";
import { Token } from "./types.ts";

describe("TokenizerContext#pushToken", () => {
  it("moves cursor by pushing token", () => {
    const ctx = new TokenizerContext({ code: "abc def ghi", position: 4 });
    const token: Token = {
      type: "var",
      start: 4,
      end: 7,
    };
    ctx.pushToken(token);
    assertEquals(ctx.tokens, [token]);
    assertEquals(ctx.position, 7);
  });

  it("throws if token does not start at current position", () => {
    const ctx = new TokenizerContext({ code: "abc def ghi", position: 4 });
    assertThrows(() => {
      ctx.pushToken({
        type: "var",
        start: 5, // <-- this is wrong
        end: 7,
      });
    });
  });

  it("throws if token ends before current position", () => {
    const ctx = new TokenizerContext({ code: "abc def ghi", position: 4 });
    assertThrows(() => {
      ctx.pushToken({
        type: "var",
        start: 4,
        end: 3, // <-- this is wrong
      });
    });
  });
});
