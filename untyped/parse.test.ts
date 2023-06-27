import { parse } from "./parse.ts";
import { assertSnapshot, assertThrows, it } from "./testUtils.ts";

[
  "x",
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
