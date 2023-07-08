import { parse } from "../parse.ts";
import { assertEquals, describe, it } from "../testUtils.ts";
import { isAlphaEquivalent, NodeNormalizer } from "./alphaEquivalence.ts";

describe(NodeNormalizer.name, () => {
  it("works for simple case", () => {
    const node = parse("(x -> (y -> (x y))) y");
    const normalized = new NodeNormalizer(node).normalize();
    assertEquals(normalized, parse("(x_0 -> (x_1 -> (x_0 x_1))) y"));
  });
});

describe(isAlphaEquivalent.name, () => {
  const testCases: [string, string, boolean][] = [
    ["x", "x", true],
    ["x", "y", false],
    ["x -> x", "y -> y", true],
    ["x -> x", "y -> x", false],
    ["a b", "a b", true],
    ["a b", "a c", false],
    ["a b", "c b", false],
    ["(a -> (b -> (a b))) (a c)", "(x -> (y -> (x y))) (a c)", true],
    ["s -> (z -> (s (s z)))", "x -> (y -> (x (x y)))", true],
    [
      "(p -> ((p (t -> (f -> f))) (t -> (f -> t)))) (t -> (f -> t))",
      "(x -> ((x (y -> (z -> z))) (y -> (z -> y)))) (y -> (z -> y))",
      true,
    ],
  ];

  testCases.forEach(([a, b, expected]) => {
    it(`returns ${expected} for "${a}" and "${b}"`, () => {
      const aNode = parse(a);
      const bNode = parse(b);
      assertEquals(isAlphaEquivalent(aNode, bNode), expected);
    });
  });
});
