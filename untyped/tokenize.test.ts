import { assertSnapshot, it } from "./testUtils.ts";
import { tokenize } from "./tokenize.ts";

[
  "x->x",
  "x x",
  "x -> y -> z",
  "xxx_000 -> yyy_111 -> zzz_222",
  "( x  ->  y )  ( x  ->  y )",
].forEach((code) => {
  it(`tokenize "${code}"`, async (t) => {
    await assertSnapshot(t, tokenize(code));
  });
});
