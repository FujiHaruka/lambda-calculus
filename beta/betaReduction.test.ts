import { parse } from "../parser/parse.ts";
import { stringify } from "../parser/stringify.ts";
import { assertEquals, assertThrows, describe, it } from "../utils/testUtils.ts";
import {
  performBetaReduction,
  performBetaReductionToRedex,
  performBetaReductionUntilDone,
  RedexNotFound,
} from "./betaReduction.ts";
import {
  InfiniteReductionError,
  MaxReductionExceededError,
  UnexpectedNodeTypeError,
} from "./errors.ts";
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
    assertThrows(
      () => performBetaReductionToRedex(node),
      UnexpectedNodeTypeError,
    );
  });

  it("throws if the node is an application but the left of the node is not abstraction", () => {
    const node = parse("((x y) x)") as BetaReducibleNode;
    assertThrows(
      () => performBetaReductionToRedex(node),
      UnexpectedNodeTypeError,
    );
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

describe(performBetaReductionUntilDone.name, () => {
  const cases: {
    code: string;
    expected: string[];
  }[] = [{
    code: "t ((x -> x) z)",
    expected: ["(t ((x -> x) z))", "(t z)"],
  }, {
    code: "((x -> x) z) ((x -> x) z)",
    expected: ["(((x -> x) z) ((x -> x) z))", "(z ((x -> x) z))", "(z z)"],
  }, {
    code: "t -> ((x -> x) ((x -> x) z))",
    expected: [
      "(t -> ((x -> x) ((x -> x) z)))",
      "(t -> ((x -> x) z))",
      "(t -> z)",
    ],
  }];

  cases.forEach(({ code, expected }) => {
    it(`reduces "${code}" with the leftmost strategy`, () => {
      const node = parse(code);
      const result = performBetaReductionUntilDone(node)
        .map(stringify);
      assertEquals(result, expected);
    });
  });

  it("throws if infinite loop is detected", () => {
    const node = parse("(x -> (x x)) (x -> (x x))");
    assertThrows(
      () => performBetaReductionUntilDone(node),
      InfiniteReductionError,
    );
  });

  it("throws if negative number or zero is given as maxReductionCount", () => {
    const node = parse("x -> y");
    assertThrows(() =>
      performBetaReductionUntilDone(node, { maxReductionCount: 0 })
    );
    assertThrows(() =>
      performBetaReductionUntilDone(node, { maxReductionCount: -1 })
    );
  });

  it("throws if max reduction count is reached", () => {
    const node = parse("((x -> x) z) ((x -> x) z) ((x -> x) z)");
    assertThrows(
      () => performBetaReductionUntilDone(node, { maxReductionCount: 1 }),
      MaxReductionExceededError,
    );
  });
});
