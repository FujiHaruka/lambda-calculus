import { parse } from "../parse.ts";
import { assertEquals, describe, it } from "../testUtils.ts";
import { collectBoundVariables, collectFreeVariables } from "./variables.ts";

describe(collectBoundVariables.name, () => {
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
  ];

  cases.forEach(({ code, expected }) => {
    it(`collects bound variables in "${code}"`, () => {
      const node = parse(code);
      assertEquals(collectBoundVariables(node), new Set(expected));
    });
  });
});

describe(collectFreeVariables.name, () => {
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
});
