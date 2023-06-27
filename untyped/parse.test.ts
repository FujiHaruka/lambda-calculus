import { parse } from "./parse.ts";
import { assertSnapshot, assertThrows, it } from "./testUtils.ts";
import { tokenize } from "./tokenize.ts";

[
  "x",
  "(x -> y)",
  "(x -> (y -> z))",
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
    const tokens = tokenize(code);
    await assertSnapshot(t, parse(code, tokens));
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
    const tokens = tokenize(code);
    assertThrows(() => parse(code, tokens));
  });
});

[
  "(x -> y",
  "(x -> (y -> z)",
  "((x y) z",
].forEach((code) => {
  it(`throws ParenthesisNotClosedError for "${code}"`, () => {
    const tokens = tokenize(code);
    assertThrows(() => parse(code, tokens));
  });
});
