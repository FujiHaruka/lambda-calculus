import { assertEquals, describe, it } from "../utils/testUtils.ts";
import { TokenizerContext } from "./TokenizerContext.ts";
import { UnexpectedCharacterError } from "./errors.ts";

describe(UnexpectedCharacterError.name, () => {
  it("has correct message", () => {
    const ctx = new TokenizerContext({ code: "!", position: 0 });
    const err = new UnexpectedCharacterError(ctx);
    assertEquals(err.message, 'Unexpected character at position 0: "!"');
  });
});
