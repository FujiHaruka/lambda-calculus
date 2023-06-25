import { assertEquals, it } from "../testUtils.ts";
import { TokenizerContext } from "./TokenizerContext.ts";
import { scanParenthesis } from "./scanParenthesis.ts";

it(`scans "("`, () => {
  const ctx = new TokenizerContext({ code: "(", position: 0 });
  const result = scanParenthesis(ctx);
  assertEquals(result, {
    type: "left_paren",
    start: 0,
    end: 1,
  });
});

it(`scans ")"`, () => {
  const ctx = new TokenizerContext({ code: ")", position: 0 });
  const result = scanParenthesis(ctx);
  assertEquals(result, {
    type: "right_paren",
    start: 0,
    end: 1,
  });
});

it("does not scan anything else", () => {
  const ctx = new TokenizerContext({ code: "abc", position: 0 });
  const result = scanParenthesis(ctx);
  assertEquals(result, null);
});

it("scans a parenthesis in the middle of the code", () => {
  const ctx = new TokenizerContext({ code: "abc(def)ghi", position: 3 });
  const result = scanParenthesis(ctx);
  assertEquals(result, {
    type: "left_paren",
    start: 3,
    end: 4,
  });
});
