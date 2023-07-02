import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";
import { assertEquals, assertThrows, describe, it } from "../testUtils.ts";
import { performBetaReductionToRedex } from "./betaReduction.ts";
import { BetaReducibleNode } from "./types.ts";

describe(performBetaReductionToRedex.name, () => {
  const cases: {
    code: string;
    expected: string;
  }[] = [{
    code: "(x -> x) z",
    expected: "z",
  }, {
    code: "(x -> y) z",
    expected: "y",
  }, {
    code: "(x -> (y -> x)) (z w)",
    expected: "(y -> (z w))",
  }, {
    code: "(f -> (f (f y))) (x -> x)",
    expected: "((x -> x) ((x -> x) y))",
  }, {
    code: "((x -> x) ((x -> x) y))",
    expected: "((x -> x) y)",
  }];

  cases.forEach(({ code, expected }) => {
    it(`converts "${code}" into "${expected}"`, () => {
      const node = parse(code) as BetaReducibleNode;
      const result = performBetaReductionToRedex(node);
      assertEquals(stringify(result), expected);
    });
  });

  it("throws if the node is not an application", () => {
    const node = parse("(x -> y)") as BetaReducibleNode;
    assertThrows(() => performBetaReductionToRedex(node));
  });

  it("throws if the node is an application but the left of the node is not abstraction", () => {
    const node = parse("((x y) x)") as BetaReducibleNode;
    assertThrows(() => performBetaReductionToRedex(node));
  });
});
