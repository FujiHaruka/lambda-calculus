import { parse } from "../parse.ts";
import { assertEquals, it } from "../testUtils.ts";
import { collectFreeVariables } from "./collectFreeVariables.ts";

const cases: {
  code: string;
  expected: string[];
}[] = [
  {
    code: "(x -> y)",
    expected: ["y"],
  },
  {
    code: "(x -> (y -> z))",
    expected: ["z"],
  },
  {
    code: "(x ((y -> x) (a -> b)))",
    expected: ["x", "b"],
  },
];

cases.forEach(({ code, expected }) => {
  it(`collects free variables in "${code}"`, () => {
    const node = parse(code);
    assertEquals(collectFreeVariables(node), new Set(expected));
  });
});
