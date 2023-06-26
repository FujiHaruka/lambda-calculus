import { parse } from "./parse.ts";
import { assertSnapshot, it } from "./testUtils.ts";
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
