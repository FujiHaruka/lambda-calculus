import { parse } from "../parse.ts";
import { assertEquals, assertThrows, describe, it } from "../testUtils.ts";
import {
  performBetaReduction,
  performBetaReductionToRedex,
  RedexNotFound,
} from "./betaReduction.ts";
import { BetaReducibleNode } from "./types.ts";

const redexCases: {
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

describe(performBetaReductionToRedex.name, () => {
  redexCases.forEach(({ code, expected }) => {
    it(`converts "${code}" into "${expected}"`, () => {
      const node = parse(code) as BetaReducibleNode;
      const result = performBetaReductionToRedex(node);
      assertEquals(result, parse(expected));
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

describe(performBetaReduction.name, () => {
  redexCases.forEach(({ code, expected }) => {
    it(`converts redex "${code}" into "${expected}"`, () => {
      const node = parse(code);
      const result = performBetaReduction(node);
      assertEquals(result, parse(expected));
    });
  });

  const cases: {
    code: string;
    expected: string;
  }[] = [
    {
      code: "t ((x -> x) z)",
      expected: "t z",
    },
    {
      code: "((x -> x) z) ((x -> x) z)",
      expected: "z ((x -> x) z)",
    },
    {
      code: "t -> ((x -> x) ((x -> x) z))",
      expected: "t -> ((x -> x) z)",
    },
  ];

  cases.forEach(({ code, expected }) => {
    it(`converts "${code}" into "${expected}" with the leftmost strategy`, () => {
      const node = parse(code);
      const result = performBetaReduction(node);
      assertEquals(result, parse(expected));
    });
  });

  it("returns RedexNotFound if there is no redex", () => {
    const node = parse("x -> y");
    const result = performBetaReduction(node);
    assertEquals(result, RedexNotFound);
  });
});
