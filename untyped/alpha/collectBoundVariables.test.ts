import { parse } from "../parse.ts";
import { assertEquals, it } from "../testUtils.ts";
import { collectBoundVariables } from "./collectBoundVariables.ts";

const cases: {
  code: string;
  expected: string[];
}[] = [
  {
    code: "(x -> y)",
    expected: ["x"],
  },
  {
    code: "(x -> (y -> z))",
    expected: ["x", "y"],
  },
  {
    code: "(x ((y -> x) (a -> b)))",
    expected: ["y", "a"],
  },
  {
    code: "((x -> y) (x z))",
    expected: ["x"],
  },
];

cases.forEach(({ code, expected }) => {
  it(`collects bound variables in "${code}"`, () => {
    const node = parse(code);
    assertEquals(collectBoundVariables(node), new Set(expected));
  });
});
