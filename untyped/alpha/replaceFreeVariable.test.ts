import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";
import { assertEquals, assertThrows, it } from "../testUtils.ts";
import { replaceFreeVariable } from "./replaceFreeVariable.ts";

const cases: {
  code: string;
  freeVar: string;
  replacement: string;
  expected: string;
}[] = [
  {
    code: "(x -> y)",
    freeVar: "y",
    replacement: "z",
    expected: "(x -> z)",
  },
  {
    code: "(x -> y)",
    freeVar: "x",
    replacement: "z",
    expected: "(x -> y)",
  },
  {
    code: "(x -> y)",
    freeVar: "w",
    replacement: "z",
    expected: "(x -> y)",
  },
  {
    code: "(x -> (y -> z))",
    freeVar: "z",
    replacement: "w",
    expected: "(x -> (y -> w))",
  },
  {
    code: "((x -> y) (y -> y))",
    freeVar: "y",
    replacement: "z",
    expected: "((x -> z) (y -> y))",
  },
  {
    code: "(x -> ((y -> x) (z (y x))))",
    freeVar: "x",
    replacement: "w",
    expected: "(x -> ((y -> x) (z (y x))))",
  },
];

cases.forEach(({ code, freeVar, replacement, expected }) => {
  it(`replaces free var "${freeVar}" with ${replacement} in "${code}"`, () => {
    const node = parse(code);
    const replaced = replaceFreeVariable(node, freeVar, {
      type: "var",
      identifier: replacement,
    });
    assertEquals(stringify(replaced), expected);
  });
});

it("throws if try to replace free var with bound var", () => {
  const node = parse("(x -> y)");
  assertThrows(
    () =>
      replaceFreeVariable(node, "y", {
        type: "var",
        identifier: "x",
      }),
  );
});
