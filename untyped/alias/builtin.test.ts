import { performBetaReductionUntilDone } from "../beta/betaReduction.ts";
import { parse } from "../parse.ts";
import { assertEquals, describe, it } from "../testUtils.ts";
import { BuiltinAliasesMap } from "./builtin.ts";
import { unfoldAliases } from "./unfold.ts";

describe("$AND", () => {
  const cases: { input: string; expected: string }[] = [
    {
      input: "$AND $TRUE $TRUE",
      expected: "$TRUE",
    },
    {
      input: "$AND $TRUE $FALSE",
      expected: "$FALSE",
    },
    {
      input: "$AND $FALSE $TRUE",
      expected: "$FALSE",
    },
    {
      input: "$AND $FALSE $FALSE",
      expected: "$FALSE",
    },
  ];

  cases.forEach(({ input, expected }) => {
    it(`The normal form of "${input}" equals to "${expected}"`, () => {
      const node = unfoldAliases(parse(input), BuiltinAliasesMap);
      const normalForm = performBetaReductionUntilDone(node).at(-1)!;

      const expectedForm = unfoldAliases(parse(expected), BuiltinAliasesMap);
      assertEquals(normalForm, expectedForm);
    });
  });
});

describe("$OR", () => {
  const cases: { input: string; expected: string }[] = [
    {
      input: "$OR $TRUE $TRUE",
      expected: "$TRUE",
    },
    {
      input: "$OR $TRUE $FALSE",
      expected: "$TRUE",
    },
    {
      input: "$OR $FALSE $TRUE",
      expected: "$TRUE",
    },
    {
      input: "$OR $FALSE $FALSE",
      expected: "$FALSE",
    },
  ];

  cases.forEach(({ input, expected }) => {
    it(`The normal form of "${input}" equals to "${expected}"`, () => {
      const node = unfoldAliases(parse(input), BuiltinAliasesMap);
      const normalForm = performBetaReductionUntilDone(node).at(-1)!;

      const expectedForm = unfoldAliases(parse(expected), BuiltinAliasesMap);
      assertEquals(normalForm, expectedForm);
    });
  });
});

describe("$NOT", () => {
  const cases: { input: string; expected: string }[] = [
    {
      input: "$NOT $TRUE",
      expected: "$FALSE",
    },
    {
      input: "$NOT $FALSE",
      expected: "$TRUE",
    },
  ];

  cases.forEach(({ input, expected }) => {
    it(`The normal form of "${input}" equals to "${expected}"`, () => {
      const node = unfoldAliases(parse(input), BuiltinAliasesMap);
      const normalForm = performBetaReductionUntilDone(node).at(-1)!;

      const expectedForm = unfoldAliases(parse(expected), BuiltinAliasesMap);
      assertEquals(normalForm, expectedForm);
    });
  });
});
