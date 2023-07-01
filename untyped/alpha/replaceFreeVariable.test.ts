import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";
import { assertEquals, it } from "../testUtils.ts";
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
  {
    code: "(x -> y)",
    freeVar: "y",
    replacement: "x",
    expected: "(_x -> x)",
  },
  {
    code: "(x -> ((x y) z))",
    freeVar: "y",
    replacement: "x",
    expected: "(_x -> ((_x x) z))",
  },
  {
    code: "((x -> (y -> (z x))) (z w))",
    freeVar: "z",
    replacement: "x",
    expected: "((_x -> (y -> (x _x))) (x w))",
  },
];

cases.forEach(({ code, freeVar, replacement, expected }) => {
  it(`replaces free var "${freeVar}" with ${replacement} in "${code}"`, () => {
    const node = parse(code);
    const replaced = replaceFreeVariable(node, freeVar, replacement);
    assertEquals(stringify(replaced), expected);
  });
});
