import { parse } from "./parse.ts";
import {
  assertEquals,
  assertSnapshot,
  assertThrows,
  it,
} from "../utils/testUtils.ts";
import { ParenthesisNotClosedError, UnexpectedTokenError } from "./errors.ts";
import { stringify } from "./stringify.ts";

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
  "(x -> y -> z)",
  "x -> y -> z -> w",
  "x -> y z",
  "x -> y -> z -> v w",
  "x -> y z w",
  "x -> y (z w)",
  "x -> (y z) w",
  "(x -> y z)",
  "(x -> y z w)",
  "((x -> y -> z) s)",
  "((x -> y -> z) s) t",
  "p (t -> f -> f)",
  "(p (t -> f -> f))",
  "p -> (p (t -> f -> f))",
  "p -> (t -> f -> f) (t -> f -> f)",
  "p -> (p (t -> f -> f)) (t -> f -> t)",
  "x -> (x y) (x y) (x y)",
].forEach((code) => {
  it(`parse "${code}"`, async (t) => {
    await assertSnapshot(t, parse(code));
  });

  it(`stringify ∘ parse is idempotent for "${code}"`, () => {
    const format = (exp: string): string => stringify(parse(exp));
    assertEquals(format(code), format(format(code)));
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
    assertThrows(() => parse(code), UnexpectedTokenError);
  });
});

[
  "(x -> y",
  "(x -> (y -> z)",
  "((x y) z",
].forEach((code) => {
  it(`throws ParenthesisNotClosedError for "${code}"`, () => {
    assertThrows(() => parse(code), ParenthesisNotClosedError);
  });
});
