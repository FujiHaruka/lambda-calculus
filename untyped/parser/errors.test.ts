import { UnexpectedTokenError } from "./errors.ts";
import { assertStringIncludes, describe, it } from "../testUtils.ts";
import { Token } from "../tokenizer/types.ts";

describe("UnexpectedTokenError", () => {
  it("tells user-friendly error message", () => {
    const token: Token = { type: "var", start: 12, end: 15 };
    const code = "foo bar baz err foo bar baz";
    const error = new UnexpectedTokenError({ token, code });
    assertStringIncludes(
      error.message,
      `
  foo bar baz err foo bar baz
              ~~~
`,
    );
  });
});
