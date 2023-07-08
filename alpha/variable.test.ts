import { parse } from "../parser/parse.ts";
import {
  assertEquals,
  assertThrows,
  describe,
  it,
} from "../utils/testUtils.ts";
import { UnsupportedSubstitutionError } from "./errors.ts";
import {
  collectBoundVariables,
  collectFreeVariables,
  replaceFreeVariable,
} from "./variable.ts";

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
    {
      code: "((x -> y) (x z))",
      expected: ["x", "y", "z"],
    },
  ];

  cases.forEach(({ code, expected }) => {
    it(`collects free variables in "${code}"`, () => {
      const node = parse(code);
      assertEquals(collectFreeVariables(node), new Set(expected));
    });
  });
});

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
});

describe(replaceFreeVariable.name, () => {
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
      assertEquals(replaced, parse(expected));
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
      UnsupportedSubstitutionError,
    );
  });
});
