import { assertSnapshot, it } from "./testUtils.ts";
import { tokenize } from "./tokenize.ts";

[
  "",
  " ",
  "x",
  " xyz ",
  "x->x",
  "x x",
  "x -> y -> z",
  "xxx_000 -> yyy_111 -> zzz_222",
  "( x  ->  y )  ( x  ->  y )",
].forEach((code) => {
  it(`tokenizes "${code}"`, async (t) => {
    await assertSnapshot(t, tokenize(code));
  });
});

it("tokenizes with eof token", async (t) => {
  await assertSnapshot(t, tokenize("x", { eofToken: true }));
})
