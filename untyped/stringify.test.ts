import { Node } from "./parser/types.ts";
import { stringify } from "./stringify.ts";
import { assertEquals, it } from "./testUtils.ts";

const cases: {
  code: string;
  ast: Node;
}[] = [{
  code: "(x -> y)",
  ast: {
    type: "abstraction",
    bound: "x",
    body: {
      type: "var",
      identifier: "y",
    },
  },
}, {
  code: "(x -> (y -> z))",
  ast: {
    type: "abstraction",
    bound: "x",
    body: {
      type: "abstraction",
      bound: "y",
      body: {
        type: "var",
        identifier: "z",
      },
    },
  },
}, {
  code: "(x y)",
  ast: {
    type: "application",
    left: {
      type: "var",
      identifier: "x",
    },
    right: {
      type: "var",
      identifier: "y",
    },
  },
}, {
  code: "(x ((y -> x) (a -> b)))",
  ast: {
    type: "application",
    left: {
      type: "var",
      identifier: "x",
    },
    right: {
      type: "application",
      left: {
        type: "abstraction",
        bound: "y",
        body: {
          type: "var",
          identifier: "x",
        },
      },
      right: {
        type: "abstraction",
        bound: "a",
        body: {
          type: "var",
          identifier: "b",
        },
      },
    },
  },
}];

cases.forEach(({ code, ast }) => {
  it(`stringifies AST into "${code}"`, () => {
    assertEquals(stringify(ast), code);
  });
});
