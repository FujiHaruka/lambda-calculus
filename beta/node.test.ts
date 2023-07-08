import { parse } from "../parser/parse.ts";
import { assertEquals, assertThrows, describe, it } from "../utils/testUtils.ts";
import {
  equal,
  findLeftmostOutermostRedex,
  isBetaReducible,
  NodeFound,
  replace,
  slice,
} from "./node.ts";
import { BetaReducibleNode, NodePath } from "./types.ts";

describe(isBetaReducible.name, () => {
  const cases: {
    code: string;
    expected: boolean;
  }[] = [{
    code: "(x -> x) z",
    expected: true,
  }, {
    code: "x y",
    expected: false,
  }, {
    code: "x -> y",
    expected: false,
  }];

  cases.forEach(({ code, expected }) => {
    it(`returns ${expected} for "${code}"`, () => {
      const node = parse(code);
      const result = isBetaReducible(node);
      assertEquals(result, expected);
    });
  });
});

describe(slice.name, () => {
  const cases: {
    code: string;
    path: NodePath;
    expected: string;
  }[] = [{
    code: "x y",
    path: [],
    expected: "x y",
  }, {
    code: "x y",
    path: ["application_left"],
    expected: "x",
  }, {
    code: "x y",
    path: ["application_right"],
    expected: "y",
  }, {
    code: "x -> y",
    path: ["abstraction_body"],
    expected: "y",
  }, {
    code: "x -> (y z)",
    path: ["abstraction_body", "application_left"],
    expected: "y",
  }, {
    code: "x -> (z (w -> y))",
    path: ["abstraction_body", "application_right", "abstraction_body"],
    expected: "y",
  }];

  cases.forEach(({ code, path, expected }) => {
    it(`returns ${expected} for "${code}" and path "${path}"`, () => {
      const node = parse(code);
      const sliced = slice(node, path);
      assertEquals(sliced, parse(expected));
    });
  });

  it("throws if the path is invalid", () => {
    const node = parse("x y");
    const path: NodePath = ["abstraction_body"];
    assertThrows(() => slice(node, path));
  });
});

describe(replace.name, () => {
  const cases: {
    code: string;
    path: NodePath;
    replacement: string;
    expected: string;
  }[] = [{
    code: "x y",
    path: [],
    replacement: "z",
    expected: "z",
  }, {
    code: "x y",
    path: ["application_left"],
    replacement: "z",
    expected: "z y",
  }, {
    code: "x y",
    path: ["application_right"],
    replacement: "z",
    expected: "x z",
  }, {
    code: "x -> y",
    path: ["abstraction_body"],
    replacement: "z (w -> v)",
    expected: "x -> (z (w -> v))",
  }, {
    code: "x -> (y z)",
    path: ["abstraction_body", "application_left"],
    replacement: "t -> t",
    expected: "x -> ((t -> t) z)",
  }, {
    code: "x -> (z (w -> y))",
    path: ["abstraction_body", "application_right", "abstraction_body"],
    replacement: "t -> t",
    expected: "x -> (z (w -> (t -> t)))",
  }];

  cases.forEach(({ code, path, replacement, expected }) => {
    it(`returns ${expected} for "${code}" and path "${path}"`, () => {
      const node = parse(code);
      const replaced = replace(node, path, parse(replacement));
      assertEquals(replaced, parse(expected));
    });
  });

  it("throws if the path is invalid", () => {
    const node = parse("x y");
    const path: NodePath = ["abstraction_body"];
    assertThrows(() => replace(node, path, parse("z")));
  });
});

describe(findLeftmostOutermostRedex.name, () => {
  const cases: {
    code: string;
    expected: NodePath;
  }[] = [{
    code: "(x -> x) z",
    expected: [],
  }, {
    code: "t -> ((x -> x) z)",
    expected: ["abstraction_body"],
  }, {
    // leftmost
    code: "((x -> x) z) ((x -> x) z)",
    expected: ["application_left"],
  }, {
    // outermost
    code: "t -> ((x -> x) ((x -> x) z))",
    expected: ["abstraction_body"],
  }];

  cases.forEach(({ code, expected }) => {
    it(`finds redex in "${code}"`, () => {
      const node = parse(code);
      const result = findLeftmostOutermostRedex(node) as {
        path: NodePath;
        node: BetaReducibleNode;
      };
      assertEquals(result.path, expected);
      assertEquals(slice(node, result.path), result.node);
    });
  });

  const notFoundCases: {
    code: string;
    expected: typeof NodeFound;
  }[] = [
    {
      code: "x y",
      expected: NodeFound,
    },
    {
      code: "x -> y",
      expected: NodeFound,
    },
  ];
  notFoundCases.forEach(({ code, expected }) => {
    it(`does not find redex in "${code}"`, () => {
      const node = parse(code);
      const result = findLeftmostOutermostRedex(node);
      assertEquals(result, expected);
    });
  });
});

describe(equal.name, () => {
  const trueCases = [
    "x -> y",
    "x -> (y z)",
    "x -> (z (w -> y))",
  ];
  trueCases.forEach((code) => {
    it(`returns true for "${code}"`, () => {
      const node = parse(code);
      const result = equal(node, node);
      assertEquals(result, true);
    });
  });

  const falseCases: {
    code1: string;
    code2: string;
  }[] = [
    {
      code1: "x -> y",
      code2: "x -> z",
    },
    {
      code1: "x -> (y z)",
      code2: "x -> (z y)",
    },
    {
      code1: "x -> (z (w -> y))",
      code2: "x -> (z (w -> z))",
    },
  ];
  falseCases.forEach(({ code1, code2 }) => {
    it(`returns false for "${code1}" and "${code2}"`, () => {
      const node1 = parse(code1);
      const node2 = parse(code2);
      const result = equal(node1, node2);
      assertEquals(result, false);
    });
  });
});
