import { parse } from "./parse.ts";
import { assertSnapshot, assertThrows, it } from "./testUtils.ts";

[
  // Single variable.
  "x",
  // Normal cases.
  "(x -> y)",
  "(x -> (y -> z))",
  "(x -> (y -> (z -> abc)))",
  "(x y)",
  "((x y) z)",
  "(x (y z))",
  "(((x y) (a b)) (c -> d))",
  "((x -> (y -> x)) (y z))",
  "((x -> (y -> x)) y)",
  "(x ((y -> x) (a -> b)))",
  "((((x -> (y -> (z -> ((x z) (y z))))) a) (x -> (y -> x))) c)",
  // You can omit top-level parentheses.
  "x -> y",
  "x y",
  "(x y) z",
  "(x y) (z w)",
  "(x y) (z -> w)",
  "x (y z)",
  "x -> (y -> z)",
  "(x -> y) z",
  "(x -> y) (z -> w)",
  // You can omit parentheses in "(a b) c" because application is left-associative.
  "x y z",
  "x y z w",
  "(x y z)",
  "(x y z w)",
  "(x y) z w",
  "x (y z) w",
  "x y (z w)",
  "x (y z w)",
  "(x y) (z w) v",
  "(x y) z (w v)",
  "x (y z) (w v)",
  "x -> (y z w)",
  "x -> (y -> (z w v))",
  "(x -> y) z w",
  // You can omit parentheses in "a -> (b -> c)" because abstraction is right-associative.
  "x -> y -> z",
  // "(x -> y -> z)", TODO: This is not supported yet.
  "x -> y -> z -> w",
  "x -> y z",
  "x -> y -> z -> v w",
  "x -> y z w",
].forEach((code) => {
  it(`parse "${code}"`, async (t) => {
    await assertSnapshot(t, parse(code));
  });
});

[
  "(x)",
  "(x -> )",
  "(x -> -> y)",
  "(x y))",
  "((x y) -> (x y))",
  "x -> y)",
  "x y)",
  "x (y z))",
].forEach((code) => {
  it(`throws UnexpectedTokenError for "${code}"`, () => {
    assertThrows(() => parse(code));
  });
});

[
  "(x -> y",
  "(x -> (y -> z)",
  "((x y) z",
].forEach((code) => {
  it(`throws ParenthesisNotClosedError for "${code}"`, () => {
    assertThrows(() => parse(code));
  });
});
