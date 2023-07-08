import { ExpressionAlias } from "./alias.ts";
import { assertEquals, assertThrows, describe, it } from "../utils/testUtils.ts";
import { parse } from "../parser/parse.ts";

describe(ExpressionAlias.name, () => {
  it("can be converted to Node", () => {
    const expression = "x -> y";
    const alias = new ExpressionAlias({
      identifier: "$FOO",
      expression,
    });
    assertEquals(alias.toNode(), parse(expression));
  });

  it("throws if identifier does not start with $", () => {
    assertThrows(() =>
      new ExpressionAlias({
        identifier: "FOO",
        expression: "x -> y",
      })
    );
  });
});
